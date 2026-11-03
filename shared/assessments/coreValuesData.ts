// Plain `.ts` import specifiers: this file is also run directly by Node
// (type stripping) from scripts/, where extensionless imports do not resolve.
import type { SelectionOption } from './types.ts';

/** The forty values to pick from, with the ends of the trait axes each stands for; no value is better than another */
export const CORE_VALUE_ENTRIES: readonly (SelectionOption & { ends: readonly string[] })[] = [
    {
        id: 'freedom', name: '自由', description: '能自己決定怎麼生活與選擇', ends: ['E5.B', 'B5.B'],
    },
    {
        id: 'security', name: '安全', description: '生活穩固、不用擔心意外', ends: ['B2.B', 'E1.A'],
    },
    {
        id: 'achievement', name: '成就', description: '達成目標、做出成果', ends: ['B6.A', 'E4.A'],
    },
    {
        id: 'relationships', name: '關係', description: '與重要的人有深的連結', ends: ['D1.A', 'E5.A'],
    },
    {
        id: 'creativity', name: '創造', description: '表達想法、做出新的東西', ends: ['A3.A', 'A6.A'],
    },
    {
        id: 'order', name: '秩序', description: '事情有條理、有規則可循', ends: ['B5.A', 'E1.A'],
    },
    {
        id: 'influence', name: '影響力', description: '能帶動他人、產生改變', ends: ['D5.A', 'E2.A'],
    },
    {
        id: 'honesty', name: '誠實', description: '說真話、與自己的想法一致', ends: ['C3.A', 'D1.B'],
    },
    {
        id: 'family', name: '家庭', description: '與家人的關係與照顧', ends: ['E5.A', 'E3.B'],
    },
    {
        id: 'health', name: '健康', description: '身心狀態良好', ends: ['B1.A'],
    },
    {
        id: 'growth', name: '成長', description: '不斷學習與變得更好', ends: ['E4.A'],
    },
    {
        id: 'learning', name: '學習', description: '不斷取得新知與技能', ends: ['A4.A', 'A1.A'],
    },
    {
        id: 'adventure', name: '冒險', description: '嘗試新鮮與刺激的體驗', ends: ['B2.A', 'E1.B'],
    },
    {
        id: 'stability', name: '穩定', description: '生活步調與環境不要大起大落', ends: ['E1.A', 'B2.B'],
    },
    {
        id: 'kindness', name: '善良', description: '對人溫和、願意幫助', ends: ['D2.A', 'D6.A'],
    },
    {
        id: 'justice', name: '公平', description: '每個人被公正對待', ends: ['D1.B', 'D6.B'],
    },
    {
        id: 'respect', name: '尊重', description: '被尊重，也尊重別人', ends: ['D6.A', 'D3.A'],
    },
    {
        id: 'independence', name: '獨立', description: '靠自己，不依賴別人', ends: ['E3.A', 'A2.A'],
    },
    {
        id: 'community', name: '社群', description: '屬於某個群體，一起做事', ends: ['D3.A', 'E3.B'],
    },
    {
        id: 'wealth', name: '財富', description: '擁有充足的金錢與資源', ends: ['B6.A', 'A6.B'],
    },
    {
        id: 'recognition', name: '被認可', description: '自己的努力與價值被看見', ends: ['D5.A', 'C2.A'],
    },
    {
        id: 'spirituality', name: '信念與靈性', description: '相信比自己更大的意義', ends: ['E2.A', 'A1.B'],
    },
    {
        id: 'nature', name: '自然', description: '親近大自然', ends: ['A6.A'],
    },
    {
        id: 'beauty', name: '美', description: '欣賞與創造美好的事物', ends: ['A6.A'],
    },
    {
        id: 'humor', name: '幽默', description: '笑與輕鬆', ends: ['C4.A', 'C2.A'],
    },
    {
        id: 'peace', name: '平靜', description: '內心與環境安定', ends: ['C1.B', 'D3.A'],
    },
    {
        id: 'balance', name: '平衡', description: '工作、生活與休息的協調', ends: ['B6.B'],
    },
    {
        id: 'courage', name: '勇氣', description: '面對恐懼仍然行動', ends: ['B2.A', 'B3.A'],
    },
    {
        id: 'loyalty', name: '忠誠', description: '對人或承諾的長久信守', ends: ['E5.A', 'E6.A'],
    },
    {
        id: 'responsibility', name: '責任', description: '把該做的事承擔起來', ends: ['E6.A', 'B4.A'],
    },
    {
        id: 'curiosity', name: '好奇', description: '想探索、想知道為什麼', ends: ['A4.A', 'A3.A'],
    },
    {
        id: 'excellence', name: '卓越', description: '把事情做到最好', ends: ['A5.A', 'B6.A'],
    },
    {
        id: 'contribution', name: '貢獻', description: '為他人或社會帶來價值', ends: ['D2.A', 'E2.A'],
    },
    {
        id: 'authenticity', name: '真實', description: '做自己，不假裝', ends: ['C3.A', 'A2.A'],
    },
    {
        id: 'simplicity', name: '簡單', description: '不要太多，生活清爽', ends: ['A6.B'],
    },
    {
        id: 'fun', name: '快樂', description: '享受當下、有趣的事', ends: ['C4.A', 'B1.B'],
    },
    {
        id: 'tradition', name: '傳統', description: '尊重與延續過去的做法', ends: ['A3.B', 'E5.A'],
    },
    {
        id: 'leadership', name: '領導', description: '帶領他人朝目標前進', ends: ['D5.A', 'B3.A'],
    },
    {
        id: 'compassion', name: '同理', description: '感受並理解別人的處境', ends: ['C1.A', 'D2.A'],
    },
    {
        id: 'collaboration', name: '合作', description: '與人一起完成事情', ends: ['D3.A', 'D5.B'],
    },
];
