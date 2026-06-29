import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NativeDeviceInfo from './specs/NativeAppDeviceInfo';

const COLORS = {
  bg: '#0F172A',
  card: '#1E293B',
  muted: '#94A3B8',
  text: '#F1F5F9',
  accent: '#38BDF8',
  success: '#4ADE80',
  warning: '#FACC15',
  purple: '#A78BFA',
};

type DeviceData = {
  batteryLevel: string | null;
  batteryState: string | null;
  systemVersion: string | null;
  systemName: string | null;
};

type CardProps = {
  emoji: string;
  label: string;
  badge: string;
  value: string | null;
  loading: boolean;
  accent: string;
};

function InfoCard({ emoji, label, badge, value, loading, accent }: CardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>{label}</Text>
          <View style={[styles.badge, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.badgeText, { color: accent }]}>{badge}</Text>
          </View>
        </View>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={accent}
            style={styles.loader}
          />
        ) : (
          <Text style={[styles.cardValue, { color: accent }]}>
            {value ?? '—'}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function App(): React.JSX.Element {
  const [data, setData] = useState<DeviceData>({
    batteryLevel: null,
    batteryState: null,
    systemVersion: null,
    systemName: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const [levelResult, stateResult] = await Promise.allSettled([
      NativeDeviceInfo.getBatteryLevel(),
      NativeDeviceInfo.getBatteryState(),
    ]);

    let systemVersion = '—';
    let systemName = '—';
    try {
      systemVersion = NativeDeviceInfo.getSystemVersion();
      systemName = NativeDeviceInfo.getSystemName();
    } catch {}

    setData({
      batteryLevel:
        levelResult.status === 'fulfilled'
          ? `${Math.round(levelResult.value)}%`
          : 'Unavailable',
      batteryState:
        stateResult.status === 'fulfilled' ? stateResult.value : 'Unavailable',
      systemVersion,
      systemName,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Device Info</Text>
          <Text style={styles.subtitle}>NativeDeviceInfo · Turbo Module</Text>
        </View>

        <Text style={styles.sectionTitle}>ASYNC</Text>
        <InfoCard
          emoji="🔋"
          label="Battery Level"
          badge="Promise<number>"
          value={data.batteryLevel}
          loading={loading}
          accent={COLORS.success}
        />
        <InfoCard
          emoji="⚡"
          label="Battery State"
          badge="Promise<string>"
          value={data.batteryState}
          loading={loading}
          accent={COLORS.warning}
        />

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>SYNC</Text>
        <InfoCard
          emoji="💻"
          label="System Version"
          badge="string"
          value={data.systemVersion}
          loading={false}
          accent={COLORS.accent}
        />
        <InfoCard
          emoji="📱"
          label="System Name"
          badge="string"
          value={data.systemName}
          loading={false}
          accent={COLORS.purple}
        />

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchData}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshEmoji}>🔄</Text>
          <Text style={styles.refreshLabel}>Refresh</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: 'Menlo',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.muted,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Menlo',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  loader: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  refreshBtn: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshEmoji: {
    fontSize: 17,
  },
  refreshLabel: {
    color: COLORS.bg,
    fontWeight: '700',
    fontSize: 16,
  },
});
