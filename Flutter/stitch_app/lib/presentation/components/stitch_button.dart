import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_tokens.dart';

enum StitchButtonType { primary, secondary, ghost, primaryContainer }

class StitchButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final String text;
  final Widget? trailing;
  final StitchButtonType type;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry padding;

  const StitchButton({
    super.key,
    this.onPressed,
    required this.text,
    this.trailing,
    this.type = StitchButtonType.primary,
    this.width,
    this.height = 56.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
  });

  @override
  State<StitchButton> createState() => _StitchButtonState();
}

class _StitchButtonState extends State<StitchButton> with SingleTickerProviderStateMixin {
  late double _scale;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 0.0,
      upperBound: 0.05,
    )..addListener(() {
        setState(() {});
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.onPressed != null) {
      _controller.forward();
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.onPressed != null) {
      _controller.reverse();
      HapticFeedback.lightImpact();
      widget.onPressed!();
    }
  }

  void _onTapCancel() {
    if (widget.onPressed != null) {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    _scale = 1.0 - _controller.value;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final bool isDisabled = widget.onPressed == null;

    Color bgColor;
    Color textColor;
    BorderSide borderSide = BorderSide.none;

    if (isDisabled) {
      bgColor = isDark ? const Color(0xFF2C2C2C) : Colors.grey.shade300;
      textColor = isDark ? const Color(0xFF757575) : Colors.grey.shade500;
    } else {
      switch (widget.type) {
        case StitchButtonType.primary:
          bgColor = colorScheme.primary;
          textColor = colorScheme.onPrimary;
          break;
        case StitchButtonType.secondary:
          bgColor = colorScheme.error; // Red accent
          textColor = colorScheme.onError;
          break;
        case StitchButtonType.primaryContainer:
          bgColor = colorScheme.primaryContainer; // Dark teal/slate
          textColor = colorScheme.onPrimary;
          break;
        case StitchButtonType.ghost:
          bgColor = isDark ? const Color(0xFF252525) : const Color(0xFFEBEBEB);
          textColor = colorScheme.primary;
          borderSide = BorderSide.none;
          break;
      }
    }

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: Transform.scale(
        scale: isDisabled ? 1.0 : _scale,
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(AppTokens.radiusFull),
            border: borderSide != BorderSide.none
                ? Border.fromBorderSide(borderSide)
                : null,
            boxShadow: (!isDisabled && widget.type != StitchButtonType.ghost)
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 10.0,
                      offset: const Offset(0, 4),
                    )
                  ]
                : null,
          ),
          padding: widget.padding,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  widget.text,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: textColor,
                        fontSize: 16.0,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ),
              if (widget.trailing != null) ...[
                const SizedBox(width: AppTokens.stackMd),
                Opacity(
                  opacity: isDisabled ? 0.5 : 1.0,
                  child: widget.trailing!,
                ),
              ]
            ],
          ),
        ),
      ),
    );
  }
}
