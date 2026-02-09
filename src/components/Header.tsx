import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/constants';
import APP_TEXT from '../utils/appText.json';

/**
 * App header (no props).
 * - Uses SafeAreaView so it aligns like the native stack header
 * - Displays only title + local asset image (no actions / no navigation)
 */
function Header() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === 'android' ? styles.bar.backgroundColor : undefined}
      />
      <View style={styles.bar}>
        <Image
          source={require('../assets/images/check-list.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title} numberOfLines={1} >
          {APP_TEXT.mainScreen.headerTitle}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default Header;

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FF6B6B',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bar: {
    height: 56,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 28,
    height: 28,
  },
  title: {
    color: COLORS.bg,
    fontSize: 24,
    fontWeight: '700',
  },
});