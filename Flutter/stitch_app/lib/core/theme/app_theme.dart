import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_tokens.dart';

@immutable
class StitchThemeExtension extends ThemeExtension<StitchThemeExtension> {
  final Color? surfaceDim;
  final Color? surfaceBright;
  final Color? surfaceContainerLowest;
  final Color? surfaceContainerLow;
  final Color? surfaceContainer;
  final Color? surfaceContainerHigh;
  final Color? surfaceContainerHighest;

  final double gutter;
  final double containerPadding;
  final double stackSm;
  final double stackMd;
  final double stackLg;

  final double radiusSm;
  final double radiusDefault;
  final double radiusMd;
  final double radiusLg;
  final double radiusXl;

  final BoxShadow shadowLevel1;
  final BoxShadow shadowLevel2;
  final BoxShadow shadowFAB;
  final BoxShadow shadowSecondaryFAB;

  const StitchThemeExtension({
    required this.surfaceDim,
    required this.surfaceBright,
    required this.surfaceContainerLowest,
    required this.surfaceContainerLow,
    required this.surfaceContainer,
    required this.surfaceContainerHigh,
    required this.surfaceContainerHighest,
    this.gutter = AppTokens.gutter,
    this.containerPadding = AppTokens.containerPadding,
    this.stackSm = AppTokens.stackSm,
    this.stackMd = AppTokens.stackMd,
    this.stackLg = AppTokens.stackLg,
    this.radiusSm = AppTokens.radiusSm,
    this.radiusDefault = AppTokens.radiusDefault,
    this.radiusMd = AppTokens.radiusMd,
    this.radiusLg = AppTokens.radiusLg,
    this.radiusXl = AppTokens.radiusXl,
    this.shadowLevel1 = AppTokens.shadowLevel1,
    this.shadowLevel2 = AppTokens.shadowLevel2,
    this.shadowFAB = AppTokens.shadowFAB,
    this.shadowSecondaryFAB = AppTokens.shadowSecondaryFAB,
  });

  @override
  StitchThemeExtension copyWith({
    Color? surfaceDim,
    Color? surfaceBright,
    Color? surfaceContainerLowest,
    Color? surfaceContainerLow,
    Color? surfaceContainer,
    Color? surfaceContainerHigh,
    Color? surfaceContainerHighest,
  }) {
    return StitchThemeExtension(
      surfaceDim: surfaceDim ?? this.surfaceDim,
      surfaceBright: surfaceBright ?? this.surfaceBright,
      surfaceContainerLowest: surfaceContainerLowest ?? this.surfaceContainerLowest,
      surfaceContainerLow: surfaceContainerLow ?? this.surfaceContainerLow,
      surfaceContainer: surfaceContainer ?? this.surfaceContainer,
      surfaceContainerHigh: surfaceContainerHigh ?? this.surfaceContainerHigh,
      surfaceContainerHighest: surfaceContainerHighest ?? this.surfaceContainerHighest,
      gutter: gutter,
      containerPadding: containerPadding,
      stackSm: stackSm,
      stackMd: stackMd,
      stackLg: stackLg,
      radiusSm: radiusSm,
      radiusDefault: radiusDefault,
      radiusMd: radiusMd,
      radiusLg: radiusLg,
      radiusXl: radiusXl,
      shadowLevel1: shadowLevel1,
      shadowLevel2: shadowLevel2,
      shadowFAB: shadowFAB,
      shadowSecondaryFAB: shadowSecondaryFAB,
    );
  }

  @override
  StitchThemeExtension lerp(ThemeExtension<StitchThemeExtension>? other, double t) {
    if (other is! StitchThemeExtension) {
      return this;
    }
    return StitchThemeExtension(
      surfaceDim: Color.lerp(surfaceDim, other.surfaceDim, t),
      surfaceBright: Color.lerp(surfaceBright, other.surfaceBright, t),
      surfaceContainerLowest: Color.lerp(surfaceContainerLowest, other.surfaceContainerLowest, t),
      surfaceContainerLow: Color.lerp(surfaceContainerLow, other.surfaceContainerLow, t),
      surfaceContainer: Color.lerp(surfaceContainer, other.surfaceContainer, t),
      surfaceContainerHigh: Color.lerp(surfaceContainerHigh, other.surfaceContainerHigh, t),
      surfaceContainerHighest: Color.lerp(surfaceContainerHighest, other.surfaceContainerHighest, t),
      gutter: gutter,
      containerPadding: containerPadding,
      stackSm: stackSm,
      stackMd: stackMd,
      stackLg: stackLg,
      radiusSm: radiusSm,
      radiusDefault: radiusDefault,
      radiusMd: radiusMd,
      radiusLg: radiusLg,
      radiusXl: radiusXl,
      shadowLevel1: shadowLevel1,
      shadowLevel2: shadowLevel2,
      shadowFAB: shadowFAB,
      shadowSecondaryFAB: shadowSecondaryFAB,
    );
  }
}

class AppTheme {
  static TextTheme _buildTextTheme(Color baseColor) {
    return TextTheme(
      displayLarge: GoogleFonts.hankenGrotesk(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        color: baseColor,
      ),
      headlineLarge: GoogleFonts.hankenGrotesk(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 36 / 28,
        letterSpacing: -0.02 * 28,
        color: baseColor,
      ),
      headlineMedium: GoogleFonts.hankenGrotesk(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        height: 28 / 22,
        color: baseColor,
      ),
      headlineSmall: GoogleFonts.hankenGrotesk(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 24 / 18,
        color: baseColor,
      ),
      bodyLarge: GoogleFonts.hankenGrotesk(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 24 / 16,
        color: baseColor,
      ),
      bodyMedium: GoogleFonts.hankenGrotesk(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 20 / 14,
        color: baseColor,
      ),
      bodySmall: GoogleFonts.hankenGrotesk(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 16 / 12,
        color: baseColor,
      ),
      labelLarge: GoogleFonts.hankenGrotesk(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 20 / 14,
        letterSpacing: 0.01 * 14,
        color: baseColor,
      ),
      labelMedium: GoogleFonts.hankenGrotesk(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 16 / 12,
        color: baseColor,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppTokens.primaryLight,
        onPrimary: AppTokens.onPrimaryLight,
        primaryContainer: AppTokens.primaryContainerLight,
        onPrimaryContainer: AppTokens.onPrimaryContainerLight,
        secondary: AppTokens.secondaryLight,
        onSecondary: AppTokens.onSecondaryLight,
        secondaryContainer: AppTokens.secondaryContainerLight,
        onSecondaryContainer: AppTokens.onSecondaryContainerLight,
        tertiary: AppTokens.tertiaryLight,
        onTertiary: AppTokens.onTertiaryLight,
        tertiaryContainer: AppTokens.tertiaryContainerLight,
        onTertiaryContainer: AppTokens.onTertiaryContainerLight,
        error: AppTokens.errorLight,
        onError: AppTokens.onErrorLight,
        errorContainer: AppTokens.errorContainerLight,
        onErrorContainer: AppTokens.onErrorContainerLight,
        surface: AppTokens.surfaceLight,
        onSurface: AppTokens.onSurfaceLight,
        onSurfaceVariant: AppTokens.onSurfaceVariantLight,
        outline: AppTokens.outlineLight,
        outlineVariant: AppTokens.outlineVariantLight,
        inverseSurface: AppTokens.inverseSurfaceLight,
        onInverseSurface: AppTokens.inverseOnSurfaceLight,
      ),
      textTheme: _buildTextTheme(AppTokens.onSurfaceLight),
      scaffoldBackgroundColor: AppTokens.backgroundLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppTokens.errorLight,
        foregroundColor: AppTokens.onPrimaryLight,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: AppTokens.errorLight,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
      ),
      extensions: const <ThemeExtension<dynamic>>[
        StitchThemeExtension(
          surfaceDim: AppTokens.surfaceDimLight,
          surfaceBright: AppTokens.surfaceBrightLight,
          surfaceContainerLowest: AppTokens.surfaceContainerLowestLight,
          surfaceContainerLow: AppTokens.surfaceContainerLowLight,
          surfaceContainer: AppTokens.surfaceContainerLight,
          surfaceContainerHigh: AppTokens.surfaceContainerHighLight,
          surfaceContainerHighest: AppTokens.surfaceContainerHighestLight,
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppTokens.primaryDark,
        onPrimary: AppTokens.onPrimaryDark,
        primaryContainer: AppTokens.primaryContainerDark,
        onPrimaryContainer: AppTokens.onPrimaryContainerDark,
        secondary: AppTokens.secondaryDark,
        onSecondary: AppTokens.onSecondaryDark,
        secondaryContainer: AppTokens.secondaryContainerDark,
        onSecondaryContainer: AppTokens.onSecondaryContainerDark,
        tertiary: AppTokens.tertiaryDark,
        onTertiary: AppTokens.onTertiaryDark,
        tertiaryContainer: AppTokens.tertiaryContainerDark,
        onTertiaryContainer: AppTokens.onTertiaryContainerDark,
        error: AppTokens.errorDark,
        onError: AppTokens.onErrorDark,
        errorContainer: AppTokens.errorContainerDark,
        onErrorContainer: AppTokens.onErrorContainerDark,
        surface: AppTokens.surfaceDark,
        onSurface: AppTokens.onSurfaceDark,
        onSurfaceVariant: AppTokens.onSurfaceVariantDark,
        outline: AppTokens.outlineDark,
        outlineVariant: AppTokens.outlineVariantDark,
        inverseSurface: AppTokens.inverseSurfaceDark,
        onInverseSurface: AppTokens.inverseOnSurfaceDark,
      ),
      textTheme: _buildTextTheme(AppTokens.onSurfaceDark),
      scaffoldBackgroundColor: AppTokens.backgroundDark,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.white,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
      ),
      extensions: const <ThemeExtension<dynamic>>[
        StitchThemeExtension(
          surfaceDim: AppTokens.surfaceDimDark,
          surfaceBright: AppTokens.surfaceBrightDark,
          surfaceContainerLowest: AppTokens.surfaceContainerLowestDark,
          surfaceContainerLow: AppTokens.surfaceContainerLowDark,
          surfaceContainer: AppTokens.surfaceContainerDark,
          surfaceContainerHigh: AppTokens.surfaceContainerHighDark,
          surfaceContainerHighest: AppTokens.surfaceContainerHighestDark,
        ),
      ],
    );
  }
}
