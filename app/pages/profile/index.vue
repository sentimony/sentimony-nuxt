<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
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
  await navigateTo('/')
}

const editing = ref(false)
const newName = ref('')
const saving = ref(false)
const nameError = ref('')
const nameInput = ref<ComponentPublicInstance | null>(null)

async function startEdit() {
  newName.value = user.value?.user_metadata?.full_name ?? ''
  nameError.value = ''
  editing.value = true
  await nextTick()
  nameInput.value?.$el.focus()
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
const confirmingDelete = ref(false)
const removeAvatarButton = ref<ComponentPublicInstance | null>(null)
const confirmDeleteButton = ref<ComponentPublicInstance | null>(null)

async function confirmAvatarDelete() {
  confirmingDelete.value = true
  await nextTick()
  confirmDeleteButton.value?.$el.focus()
}

async function cancelAvatarDelete() {
  confirmingDelete.value = false
  await nextTick()
  removeAvatarButton.value?.$el.focus()
}

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
  confirmingDelete.value = false
  toast.success('Avatar removed')
}
</script>

<template>
  <section aria-labelledby="profile-overview-title" class="mx-auto max-w-5xl">
    <div class="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="relative min-h-40 rounded-lg border border-foreground/10 bg-foreground/3 p-5 text-left"
      >
        <div class="mb-3 flex items-center justify-between">
          <label for="profile-name" class="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Name
          </label>
          <Button
            v-if="!editing"
            type="button"
            variant="default"
            aria-label="Edit name"
            class="w-9 px-0"
            @click="startEdit"
          >
            <Icon name="lucide:pencil" size="14" />
          </Button>
        </div>

        <div v-if="!editing" class="text-sm text-foreground">
          {{ user?.user_metadata?.full_name || 'Not set' }}
        </div>

        <div v-else>
          <Input
            ref="nameInput"
            v-model="newName"
            id="profile-name"
            type="text"
            :aria-invalid="!!nameError"
            :aria-describedby="nameError ? 'profile-name-error' : undefined"
            @keydown="handleNameKeydown"
          />
          <span
            v-if="nameError"
            id="profile-name-error"
            role="alert"
            class="mt-1 block text-xs text-destructive"
          >
            {{ nameError }}
          </span>
          <div class="mt-2 flex gap-2">
            <Button
              type="button"
              variant="submit"
              :disabled="saving"
              class="flex-1"
              @click="saveName"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </Button>
            <Button
              type="button"
              variant="default"
              aria-label="Cancel"
              class="w-9 px-0"
              @click="cancelEdit"
            >
              <Icon name="lucide:x" size="16" />
            </Button>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-foreground/10 bg-foreground/3 p-5 text-left">
        <p class="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Email</p>
        <p class="break-all text-sm text-foreground">{{ user?.email }}</p>
      </div>

      <div class="rounded-lg border border-foreground/10 bg-foreground/3 p-5 text-left">
        <p class="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Avatar</p>
        <div class="flex items-center gap-4">
          <div class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-muted-foreground">
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
            <div class="flex gap-1">
              <Button
                type="button"
                variant="default"
                :disabled="uploadingAvatar || deletingAvatar"
                class="px-2 text-xs"
                @click="avatarInput?.click()"
              >
                <Icon name="lucide:upload" size="15" />
                {{ uploadingAvatar ? 'Uploading…' : 'Upload' }}
              </Button>
              <Button
                ref="removeAvatarButton"
                v-if="avatarUrl && !avatarFailed && !confirmingDelete"
                type="button"
                variant="default"
                :disabled="deletingAvatar || uploadingAvatar"
                aria-label="Remove avatar"
                class="w-9 px-0 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                @click="confirmAvatarDelete"
              >
                <Icon name="lucide:trash-2" size="15" />
              </Button>
              <div
                v-else-if="avatarUrl && !avatarFailed"
                class="flex gap-1"
                @keydown.esc="cancelAvatarDelete"
              >
                <Button
                  ref="confirmDeleteButton"
                  type="button"
                  variant="default"
                  :disabled="deletingAvatar || uploadingAvatar"
                  class="px-1.5 text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  @click="deleteAvatar"
                >
                  Remove?
                </Button>
                <Button
                  type="button"
                  variant="default"
                  :disabled="deletingAvatar"
                  class="px-1.5 text-xs"
                  @click="cancelAvatarDelete"
                >
                  Cancel
                </Button>
              </div>
            </div>
            <p class="text-[10px] text-muted-foreground">JPG, PNG, WebP · max 2 MB</p>
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

      <div class="rounded-lg border border-foreground/10 bg-foreground/3 p-5 text-left">
        <p class="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Account</p>
        <Button
          type="button"
          variant="default"
          @click="signOut"
        >
          <Icon name="lucide:log-out" size="15" />
          Sign out
        </Button>
      </div>
    </div>

    <div class="mb-8 text-center">
      <h1
        id="profile-overview-title"
        class="font-julius text-2xl tracking-wide text-foreground sm:text-3xl"
      >
        {{ totalSaved }} saved {{ totalSaved === 1 ? 'item' : 'items' }}
      </h1>
      <p class="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground">
        Your personal archive of music, artists, videos and events from Sentimony Records.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <NuxtLink
        v-for="section in profileSections"
        :key="section.key"
        :to="`/profile/${section.key}`"
        class="group relative overflow-hidden rounded-lg border border-foreground/10 bg-foreground/3 p-5 text-left transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-foreground/6 motion-reduce:transform-none"
      >
        <div class="flex items-start justify-between gap-4">
          <span class="flex size-9 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-[color,background-color] duration-200 group-hover:bg-foreground/10 group-hover:text-foreground">
            <Icon :name="section.icon" size="17" />
          </span>
          <span class="font-mono text-2xl text-muted-foreground">
            {{ summary?.[section.key] ?? 0 }}
          </span>
        </div>

        <div class="mt-7 flex items-end justify-between gap-3">
          <h2 class="text-xs uppercase tracking-[0.18em] text-foreground">
            {{ section.label }}
          </h2>
          <Icon
            name="lucide:arrow-right"
            size="15"
            class="text-muted-foreground transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transform-none"
          />
        </div>
      </NuxtLink>
    </div>

    <p
      v-if="totalSaved === 0"
      class="mt-8 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
    >
      Explore the catalogue and add favourites to start your collection
    </p>
  </section>
</template>
