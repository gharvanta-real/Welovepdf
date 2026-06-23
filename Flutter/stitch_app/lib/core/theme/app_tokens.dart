import 'package:flutter/material.dart';

class AppTokens {
  // Spacing (Fluid Grid)
  static const double base = 8.0;
  static const double gutter = 16.0;
  static const double containerPadding = 20.0;
  static const double stackSm = 4.0;
  static const double stackMd = 12.0;
  static const double stackLg = 24.0;

  // Border Radius
  static const double radiusSm = 4.0;
  static const double radiusDefault = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 9999.0;

  // Elevations & Shadows
  static const BoxShadow shadowLevel1 = BoxShadow(
    color: Color(0x0A000000), // rgba(0,0,0,0.04)
    blurRadius: 20.0,
    offset: Offset(0, 4),
  );

  static const BoxShadow shadowLevel2 = BoxShadow(
    color: Color(0x14000000), // rgba(0,0,0,0.08)
    blurRadius: 30.0,
    offset: Offset(0, 8),
  );

  static const BoxShadow shadowFAB = BoxShadow(
    color: Color(0x1F000000), // subtle black shadow
    blurRadius: 12.0,
    offset: Offset(0, 4),
  );

  static const BoxShadow shadowSecondaryFAB = BoxShadow(
    color: Color(0x1F000000), // subtle black shadow
    blurRadius: 12.0,
    offset: Offset(0, 4),
  );

  // Light Mode Colors (Clean Monochrome - Black / White / Neutral)
  static const Color primaryLight = Color(0xFF1A1A1A); // Near-black text/primary
  static const Color onPrimaryLight = Color(0xFFFFFFFF);
  static const Color primaryContainerLight = Color(0xFF1A1A1A); // Black container
  static const Color onPrimaryContainerLight = Color(0xFFFFFFFF);

  static const Color secondaryLight = Color(0xFF555555); // Neutral grey secondary
  static const Color onSecondaryLight = Color(0xFFFFFFFF);
  static const Color secondaryContainerLight = Color(0xFFF0F0F0);
  static const Color onSecondaryContainerLight = Color(0xFF333333);

  static const Color tertiaryLight = Color(0xFF555555); // Grey tertiary
  static const Color onTertiaryLight = Color(0xFFFFFFFF);
  static const Color tertiaryContainerLight = Color(0xFFF0F0F0);
  static const Color onTertiaryContainerLight = Color(0xFF1A1A1A);

  static const Color errorLight = Color(0xFF1A1A1A); // Black for core accents/errors in monochrome
  static const Color onErrorLight = Color(0xFFFFFFFF);
  static const Color errorContainerLight = Color(0xFFF0F0F0);
  static const Color onErrorContainerLight = Color(0xFF1A1A1A);

  static const Color backgroundLight = Color(0xFFF5F5F5); // Clean light grey
  static const Color onBackgroundLight = Color(0xFF1A1A1A);

  static const Color surfaceLight = Color(0xFFFFFFFF); // Pure white surface
  static const Color onSurfaceLight = Color(0xFF1A1A1A);
  static const Color surfaceVariantLight = Color(0xFFF0F0F0);
  static const Color onSurfaceVariantLight = Color(0xFF555555);

  static const Color surfaceDimLight = Color(0xFFE0E0E0);
  static const Color surfaceBrightLight = Color(0xFFFFFFFF);
  static const Color surfaceContainerLowestLight = Color(0xFFFFFFFF);
  static const Color surfaceContainerLowLight = Color(0xFFF7F7F7);
  static const Color surfaceContainerLight = Color(0xFFF0F0F0);
  static const Color surfaceContainerHighLight = Color(0xFFE8E8E8);
  static const Color surfaceContainerHighestLight = Color(0xFFE0E0E0);

  static const Color outlineLight = Color(0xFF888888);
  static const Color outlineVariantLight = Color(0xFFCCCCCC);
  static const Color inverseSurfaceLight = Color(0xFF1A1A1A);
  static const Color inverseOnSurfaceLight = Color(0xFFF5F5F5);

  // Dark Mode Colors (Premium Charcoal / Dark Monochrome Mapping)
  static const Color primaryDark = Color(0xFFFFFFFF); // White Accent
  static const Color onPrimaryDark = Color(0xFF121212);
  static const Color primaryContainerDark = Color(0xFF2C2C2C); // Charcoal container
  static const Color onPrimaryContainerDark = Color(0xFFFFFFFF);

  static const Color secondaryDark = Color(0xFFB0B0B0); // Neutral grey (no blue tint)
  static const Color onSecondaryDark = Color(0xFF1A1A1A);
  static const Color secondaryContainerDark = Color(0xFF2C2C2C); // Dark charcoal container
  static const Color onSecondaryContainerDark = Color(0xFFE3E3E3);

  static const Color tertiaryDark = Color(0xFFB0B0B0);
  static const Color onTertiaryDark = Color(0xFF121212);
  static const Color tertiaryContainerDark = Color(0xFF2C2C2C);
  static const Color onTertiaryContainerDark = Color(0xFFFFFFFF);

  static const Color errorDark = Color(0xFFFFFFFF); // White for core accents in dark mode
  static const Color onErrorDark = Color(0xFF121212);
  static const Color errorContainerDark = Color(0xFF2C2C2C);
  static const Color onErrorContainerDark = Color(0xFFFFFFFF);

  static const Color backgroundDark = Color(0xFF121212); // Deep Charcoal Background
  static const Color onBackgroundDark = Color(0xFFE3E3E3); // High-contrast Off-white text

  static const Color surfaceDark = Color(0xFF161616); // Slightly lighter charcoal surface
  static const Color onSurfaceDark = Color(0xFFE3E3E3);
  static const Color surfaceVariantDark = Color(0xFF2C2C2C);
  static const Color onSurfaceVariantDark = Color(0xFFB0B0B0);

  static const Color surfaceDimDark = Color(0xFF0F0F0F);
  static const Color surfaceBrightDark = Color(0xFF242424);
  static const Color surfaceContainerLowestDark = Color(0xFF0A0A0A);
  static const Color surfaceContainerLowDark = Color(0xFF141414);
  static const Color surfaceContainerDark = Color(0xFF1E1E1E); // Standard cards in dark theme
  static const Color surfaceContainerHighDark = Color(0xFF282828); // Elevated items
  static const Color surfaceContainerHighestDark = Color(0xFF323232); // FAB / Active items

  static const Color outlineDark = Color(0xFF555555); // Border lines
  static const Color outlineVariantDark = Color(0xFF2C2C2C);
  static const Color inverseSurfaceDark = Color(0xFFE3E3E3);
  static const Color inverseOnSurfaceDark = Color(0xFF121212);
}
