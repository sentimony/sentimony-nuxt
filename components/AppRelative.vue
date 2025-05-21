<template>
    <div>
        <p><small><b>{{ title }}</b></small></p>
        <p
            v-for="(i, index) in list"
            :key="index"
            v-if="i.visible && filter.includes(i.slug)"
        >
            <span v-if="i.cover_xl">
                <img style="width:11px;height:auto;"
                    :src="i.cover_xl"
                    :alt="i.title"
                >
                |
            </span>
            {{ i.title }}
            |
            {{ i.date | year }}
            |
            <router-link v-ripple :to="'../../' + category + '/' + i.slug + '/'">Read More</router-link>
        </p>
    </div>
</template>

<script>
    import moment from 'moment'

    export default {
        props: ['title', 'list', 'filter', 'category'],
        filters: {
            year: function (date) {
                if (date) {
                    return moment(String(date)).format('YYYY');
                }
            }
        }
    }
</script>

<style lang="scss">
</style>
