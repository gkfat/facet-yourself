import { ELEMENT_LABELS } from '../../shared/constants/bazi';
import { dayPillarOf } from '../../shared/utils/bazi/dayPillar';
import { stemElement } from '../../shared/utils/bazi/ganzhi';

/**
 * The short label of a BaZi chart for a birth date, "庚金日主・屬猴". The day stem only needs the date; the zodiac needs
 * the date of 立春, so the astronomy module is loaded on demand and the label shows the day master alone until it is in.
 */
export function useBaziBadge(birthDate: Ref<string | null | undefined>): ComputedRef<string> {
    const zodiac = ref('');

    watch(birthDate, async (date) => {
        zodiac.value = '';

        if (!date) return;

        try {
            const { baziZodiacOfDate } = await import('../../shared/utils/bazi/zodiac');
            const result = baziZodiacOfDate(date);

            // A later date may have been chosen while the module was loading
            if (birthDate.value === date) zodiac.value = result;
        } catch (error) {
            console.error('[bazi-badge] zodiac failed:', error);
        }
    }, { immediate: true });

    return computed(() => {
        const date = birthDate.value;

        if (!date) return '';

        const { stem } = dayPillarOf(date);
        const dayMaster = `${stem}${ELEMENT_LABELS[stemElement(stem)]}日主`;

        return zodiac.value ? `${dayMaster}・屬${zodiac.value}` : dayMaster;
    });
}
