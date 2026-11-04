/** Ask again with the same systems and question, through the form that makes them */
export function retryTo(report: {
    sources: ReadonlyArray<{ system: string }>;
    question: string | null;
}) {
    return {
        path: '/report',
        query: {
            systems: report.sources.map((source) => source.system).join(','),
            ...(report.question ? { question: report.question } : {}),
        },
    };
}
