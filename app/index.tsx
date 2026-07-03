import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { KINETIC_COLORS as colors } from '@/components/AuthControls';
import { useAuthSession } from '@/providers/AuthSessionProvider';

export default function LaunchScreen() {
  const { session, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={session ? '/dashboard' : '/login'} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
