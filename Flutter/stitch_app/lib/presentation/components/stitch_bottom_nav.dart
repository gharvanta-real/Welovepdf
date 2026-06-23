import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_tokens.dart';

class StitchBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const StitchBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF161616) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2C2C2C) : const Color(0xFFC1C8C9).withOpacity(0.5);

    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(
          top: BorderSide(color: borderColor, width: 1.0),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000), // rgba(0,0,0,0.04)
            blurRadius: 20,
            offset: Offset(0, -4),
          )
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(context, 0, Icons.home_rounded, 'Home'),
            _buildNavItem(context, 1, Icons.history_rounded, 'Recent'),
            const SizedBox(width: 48), // Gap for center FAB
            _buildNavItem(context, 3, Icons.folder_rounded, 'Files'),
            _buildNavItem(context, 2, Icons.construction_rounded, 'Tools'),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, int index, IconData icon, String label) {
    final theme = Theme.of(context);
    final isActive = currentIndex == index;

    final activeColor = theme.colorScheme.error; // PDF Red active color
    final inactiveColor = theme.colorScheme.onSurfaceVariant.withOpacity(0.6);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        HapticFeedback.selectionClick();
        onTap(index);
      },
      child: AnimatedScale(
        scale: isActive ? 1.05 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isActive ? activeColor : inactiveColor,
              size: 26,
            ),
            const SizedBox(height: AppTokens.stackSm),
            Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
