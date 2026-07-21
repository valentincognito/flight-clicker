import { StyleSheet, Text, View } from 'react-native';

import { ResourceIcon } from '@/components/game/hud/gameIcons';
import type { CurrencyId } from '@/types/game';
import { formatAmount } from '@/utils/format';

/** A single resource chip for the top HUD: icon + live amount. */
export function ResourceCounter({ currency, amount }: { currency: CurrencyId; amount: number }) {
  return (
    <View style={styles.chip}>
      <ResourceIcon currency={currency} />
      <Text style={styles.amount}>{formatAmount(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2a3a',
    fontVariant: ['tabular-nums'],
  },
});
