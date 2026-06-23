import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_tokens.dart';
import '../../core/theme/glassmorphism.dart';
import '../components/stitch_button.dart';
import '../components/stitch_pdf_badge.dart';
import '../state/app_state.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _floatController;

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _floatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: isDark ? const Color(0xFF121212) : Colors.white,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
        systemNavigationBarColor: isDark ? const Color(0xFF121212) : Colors.white,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: isDark ? null : Colors.white,
      body: Stack(
        children: [
          // Ambient Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? const Color(0xFF2C2C2C).withOpacity(0.4)
                    : theme.colorScheme.error.withOpacity(0.06),
              ),
              child: ImageFiltered(
                imageFilter: javaScriptBlurFilter(100),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? const Color(0xFF1E1E1E).withOpacity(0.3)
                    : Colors.white.withOpacity(0.6),
              ),
              child: ImageFiltered(
                imageFilter: javaScriptBlurFilter(80),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),

          // Main Content Canvas
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTokens.containerPadding,
                vertical: AppTokens.gutter,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Logo / Brand Branding Area
                  Padding(
                    padding: const EdgeInsets.only(top: AppTokens.gutter),
                    child: Text(
                      'Meet PDFmount',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: theme.colorScheme.error,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),

                  // Animated Document Cluster
                  Expanded(
                    child: Center(
                      child: SizedBox(
                        width: double.infinity,
                        height: 320,
                        child: Stack(
                          alignment: Alignment.center,
                          clipBehavior: Clip.none,
                          children: [
                            // Central Decorative Orb
                            Container(
                              width: 180,
                              height: 180,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [
                                    theme.colorScheme.error.withOpacity(0.08),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),

                            // Word Document (Top Right)
                            AnimatedBuilder(
                              animation: _floatController,
                              builder: (context, child) {
                                final offset = math.sin(_floatController.value * 2 * math.pi + 1.0) * 10;
                                return Positioned(
                                  top: 10 + offset,
                                  right: 20,
                                  child: Transform.rotate(
                                    angle: -12 * math.pi / 180,
                                    child: child,
                                  ),
                                );
                              },
                              child: _buildDocCard(context, 'Report.doc', 'WORD'),
                            ),

                            // Excel Document (Bottom Left)
                            AnimatedBuilder(
                              animation: _floatController,
                              builder: (context, child) {
                                final offset = math.sin(_floatController.value * 2 * math.pi + 2.0) * 12;
                                return Positioned(
                                  bottom: 20 + offset,
                                  left: 20,
                                  child: Transform.rotate(
                                    angle: 12 * math.pi / 180,
                                    child: child,
                                  ),
                                );
                              },
                              child: _buildDocCard(context, 'Budget.xls', 'EXCEL'),
                            ),

                            // PPT Document (Bottom Right)
                            AnimatedBuilder(
                              animation: _floatController,
                              builder: (context, child) {
                                final offset = math.sin(_floatController.value * 2 * math.pi) * 8;
                                return Positioned(
                                  bottom: 10 + offset,
                                  right: 30,
                                  child: Transform.rotate(
                                    angle: -6 * math.pi / 180,
                                    child: child,
                                  ),
                                );
                              },
                              child: _buildDocCard(context, 'Pitch.ppt', 'PPT'),
                            ),

                            // Primary PDF Document (Center Front)
                            AnimatedBuilder(
                              animation: _floatController,
                              builder: (context, child) {
                                final offset = math.sin(_floatController.value * 2 * math.pi) * 15;
                                return Transform.translate(
                                  offset: Offset(0, offset),
                                  child: child,
                                );
                              },
                              child: StitchGlassContainer(
                                width: 120,
                                height: 140,
                                borderRadius: AppTokens.radiusXl,
                                shadow: AppTokens.shadowLevel2,
                                padding: const EdgeInsets.all(AppTokens.base * 1.5),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const StitchPdfBadge(fileType: 'pdf', scale: 1.1),
                                    const SizedBox(height: AppTokens.stackMd),
                                    Text(
                                      'Contract.pdf',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        color: theme.colorScheme.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Typography & CTA
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Manage documents easily',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineLarge?.copyWith(
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: AppTokens.stackMd),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppTokens.base * 2),
                        child: Text(
                          'Seamlessly edit, convert, and organize all your PDF and office files in one secure place.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            height: 1.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppTokens.stackLg * 1.5),
                      StitchButton(
                        type: StitchButtonType.secondary,
                        text: 'Get Started',
                        onPressed: () {
                          Provider.of<AppState>(context, listen: false)
                              .setScreen(AppScreen.dashboard);
                        },
                        trailing: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: (isDark ? Colors.black : Colors.white).withOpacity(0.15),
                          ),
                          child: Icon(
                            Icons.arrow_forward,
                            color: isDark ? Colors.black : Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppTokens.stackLg),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),);
  }

  Widget _buildDocCard(BuildContext context, String filename, String filetype) {
    final theme = Theme.of(context);
    return StitchGlassContainer(
      width: 100,
      height: 120,
      borderRadius: AppTokens.radiusLg,
      shadow: AppTokens.shadowLevel1,
      padding: const EdgeInsets.all(AppTokens.base),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          StitchPdfBadge(fileType: filetype, scale: 0.9),
          const SizedBox(height: AppTokens.stackMd),
          Text(
            filename,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  // Helper blur filter matching browser blur
  ImageFilter javaScriptBlurFilter(double radius) {
    return ImageFilter.blur(sigmaX: radius / 2, sigmaY: radius / 2);
  }
}
