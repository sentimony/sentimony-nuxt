<script setup lang="ts">
import { profileSections } from '~/utils/profileSections'
import { toast } from 'vue-sonner'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { data: summary } = await useProfileSummary()

const totalSaved = computed(() =>
  profileSections.reduce(
    (total, section) => total + (summary.value?.[section.key] ?? 0),
    0,
  )
)

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/signin')
}

const editing = ref(false)
const newName = ref('')
const saving = ref(false)
const nameError = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

async function startEdit() {
  newName.value = user.value?.user_metadata?.full_name ?? ''
  nameError.value = ''
  editing.value = true
  await nextTick()
  nameInput.value?.focus()
}

function cancelEdit() {
  editing.value = false
  nameError.value = ''
}

function handleNameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') saveName()
  else if (e.key === 'Escape') cancelEdit()
}

async function saveName() {
  if (saving.value) return
  const trimmed = newName.value.trim()
  if (!trimmed) { nameError.value = 'Name cannot be empty'; return }
  if (trimmed === (user.value?.user_metadata?.full_name ?? '')) { editing.value = false; return }
  saving.value = true
  nameError.value = ''
  const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } })
  if (!error) await supabase.auth.refreshSession()
  saving.value = false
  if (error) { nameError.value = error.message; return }
  editing.value = false
  toast.success('Name updated')
}

const avatarUrl = computed(() => {
  const meta = user.value?.user_metadata as Record<string, unknown> | undefined
  return (meta?.avatar_url as string) || ''
})
const avatarFailed = ref(false)
watch(avatarUrl, () => { avatarFailed.value = false })

const avatarInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)

async function uploadAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !user.value) return
  if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
  if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return }

  const userId = (user.value as Record<string, unknown>)?.sub as string ?? user.value?.id
  if (!userId) { toast.error('Could not identify user'); return }

  uploadingAvatar.value = true
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (uploadError) { toast.error(uploadError.message); uploadingAvatar.value = false; return }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const url = `${data.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: url } })
  if (!updateError) await supabase.auth.refreshSession()
  uploadingAvatar.value = false
  if (updateError) { toast.error(updateError.message); return }
  toast.success('Avatar updated')
  if (avatarInput.value) avatarInput.value.value = ''
}

const deletingAvatar = ref(false)

async function deleteAvatar() {
  if (deletingAvatar.value || !user.value) return
  const userId = (user.value as Record<string, unknown>)?.sub as string ?? user.value?.id
  if (!userId) return

  deletingAvatar.value = true
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  await Promise.allSettled(
    extensions.map(ext => supabase.storage.from('avatars').remove([`${userId}/avatar.${ext}`]))
  )
  const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } })
  if (!error) await supabase.auth.refreshSession()
  deletingAvatar.value = false
  if (error) { toast.error(error.message); return }
  toast.success('Avatar removed')
}
</script>

<template>
  <section aria-labelledby="profile-overview-title" class="mx-auto max-w-5xl">
    <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        class="relative rounded-lg border border-black/10 bg-black/3 p-5 text-left dark:border-white/10 dark:bg-white/3"
      >
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[9px] uppercase tracking-[0.24em] text-foreground/30">Name</p>
          <button
            v-if="!editing"
            type="button"
            aria-label="Edit name"
            class="text-foreground/40 hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded cursor-pointer transition-colors p-0.5"
            @click="startEdit"
          >
            <Icon name="lucide:pencil" size="14" />
          </button>
        </div>

        <div v-if="!editing" class="text-sm text-foreground/70">
          {{ user?.user_metadata?.full_name || '—' }}
        </div>

        <div v-else>
          <input
            ref="nameInput"
            v-model="newName"
            type="text"
            class="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-black/40"
            @keydown="handleNameKeydown"
          />
          <p v-if="nameError" class="mt-1 text-[10px] text-red-400">{{ nameError }}</p>
          <div class="mt-2 flex gap-2">
            <button
              type="button"
              :disabled="saving"
              class="flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer"
              @click="saveName"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button
              type="button"
              aria-label="Cancel"
              class="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-foreground/60 transition-colors hover:bg-white/20 cursor-pointer"
              @click="cancelEdit"
            >
              <Icon name="lucide:x" size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-black/10 bg-black/3 p-5 text-left dark:border-white/10 dark:bg-white/3">
        <p class="mb-3 text-[9px] uppercase tracking-[0.24em] text-foreground/30">Email</p>
        <p class="text-sm text-foreground/70 break-all">{{ user?.email }}</p>
      </div>

      <div class="rounded-lg border border-black/10 bg-black/3 p-5 text-left dark:border-white/10 dark:bg-white/3">
        <p class="mb-3 text-[9px] uppercase tracking-[0.24em] text-foreground/30">Avatar</p>
        <div class="flex items-center gap-4">
          <div class="size-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0 text-foreground/40">
            <img
              v-if="avatarUrl && !avatarFailed"
              :src="avatarUrl"
              alt="Avatar"
              class="size-full object-cover"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            />
            <Icon v-else name="lucide:user-round" size="24" />
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <button
                type="button"
                :disabled="uploadingAvatar || deletingAvatar"
                class="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm text-foreground/50 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground/80 disabled:opacity-50 cursor-pointer"
                @click="avatarInput?.click()"
              >
                <Icon name="lucide:upload" size="15" />
                {{ uploadingAvatar ? 'Uploading…' : 'Upload' }}
              </button>
              <button
                v-if="avatarUrl && !avatarFailed"
                type="button"
                :disabled="deletingAvatar || uploadingAvatar"
                aria-label="Remove avatar"
                class="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/10 px-2.5 py-2 text-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30 disabled:opacity-50 cursor-pointer"
                @click="deleteAvatar"
              >
                <Icon name="lucide:trash-2" size="15" />
              </button>
            </div>
            <p class="text-[9px] text-foreground/25">JPG, PNG, WebP · max 2 MB</p>
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="uploadAvatar"
        />
      </div>

      <div class="rounded-lg border border-black/10 bg-black/3 p-5 text-left dark:border-white/10 dark:bg-white/3">
        <p class="mb-3 text-[9px] uppercase tracking-[0.24em] text-foreground/30">Account</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm text-foreground/50 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground/80 cursor-pointer"
          @click="signOut"
        >
          <Icon name="lucide:log-out" size="15" />
          Sign out
        </button>
      </div>
    </div>

    <div class="mb-8 text-center">
      <p class="mb-2 text-[9px] uppercase tracking-[0.28em] text-foreground/30">
        Collection overview
      </p>
      <h1
        id="profile-overview-title"
        class="font-julius text-2xl tracking-wide text-foreground/85 sm:text-3xl"
      >
        {{ totalSaved }} saved {{ totalSaved === 1 ? 'item' : 'items' }}
      </h1>
      <p class="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-foreground/35">
        Your personal archive of music, artists, videos and events from Sentimony Records.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <NuxtLink
        v-for="section in profileSections"
        :key="section.key"
        :to="`/profile/${section.key}`"
        class="group relative overflow-hidden rounded-lg border border-black/10 bg-black/3 p-5 text-left transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:bg-black/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transform-none dark:border-white/10 dark:bg-white/3 dark:hover:border-white/20 dark:hover:bg-white/6"
      >
        <div class="flex items-start justify-between gap-4">
          <span class="flex size-9 items-center justify-center rounded-full bg-black/5 text-foreground/45 transition-colors duration-200 group-hover:bg-black/10 group-hover:text-foreground/70 dark:bg-white/5 dark:group-hover:bg-white/10">
            <Icon :name="section.icon" size="17" />
          </span>
          <span class="font-mono text-2xl text-foreground/20">
            {{ summary?.[section.key] ?? 0 }}
          </span>
        </div>

        <div class="mt-7 flex items-end justify-between gap-3">
          <div>
            <h2 class="text-xs uppercase tracking-[0.18em] text-foreground/70">
              {{ section.label }}
            </h2>
            <p class="mt-1 text-[10px] text-foreground/30">
              Open collection
            </p>
          </div>
          <Icon
            name="lucide:arrow-right"
            size="15"
            class="text-foreground/20 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground/50 motion-reduce:transform-none"
          />
        </div>
      </NuxtLink>
    </div>

    <p
      v-if="totalSaved === 0"
      class="mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-foreground/25"
    >
      Explore the catalogue and add favourites to start your collection
    </p>
  </section>
</template>
