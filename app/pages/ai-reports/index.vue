<template>
    <div class="report-page">
        <ReportBanner
            title="分析紀錄"
            headline="回頭看 AI 的解讀"
            tone="green"
        />

        <GuestNotice v-if="!isAuthenticated">
            綜合分析要登入後用點數取得，登入後這裡會列出你所有的分析紀錄。
        </GuestNotice>

        <AiReportList v-else />
    </div>
</template>

<script lang="ts" setup>
useHead({ title: '分析紀錄' });

const { isAuthenticated } = useAuth();
</script>
