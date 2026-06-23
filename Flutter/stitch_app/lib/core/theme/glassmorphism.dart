import 'dart:ui';
import 'package:flutter/material.dart';
import 'app_tokens.dart';

class StitchGlassContainer extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final double blurSigma;
  final Color? borderColor;
  final Color? backgroundColor;
  final BoxShadow? shadow;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const StitchGlassContainer({
    super.key,
    required this.child,
    this.borderRadius = AppTokens.radiusLg,
    this.blurSigma = 12.0,
    this.borderColor,
    this.backgroundColor,
    this.shadow,
    this.width,
    this.height,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final defaultBorderColor = Theme.of(context).brightness == Brightness.light
        ? Colors.white.withOpacity(0.3)
        : Colors.white.withOpacity(0.1);

    final defaultBgColor = Theme.of(context).brightness == Brightness.light
        ? Colors.white.withOpacity(0.7)
        : const Color(0xFF1E1E1E).withOpacity(0.6);

    return Container(
      margin: margin,
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: shadow != null ? [shadow!] : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: backgroundColor ?? defaultBgColor,
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: borderColor ?? defaultBorderColor,
                width: 1.0,
              ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
