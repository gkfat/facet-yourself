/** Ask again with the same systems and question, through the form that makes them */
export function retryTo(report: {
    sources: ReadonlyArray<{ system: string }>;
    question: string | null;
}) {
    return {
        path: '/report',
        query: { systems: report.sources.map((source) => source.system).join(',') },
        // Free text stays out of the address, so it never reaches analytics
        ...(report.question ? { state: { question: report.question } } : {}),
    };
}
