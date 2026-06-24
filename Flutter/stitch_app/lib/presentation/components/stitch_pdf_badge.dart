import 'package:flutter/material.dart';
import '../../core/theme/app_tokens.dart';

class StitchPdfBadge extends StatelessWidget {
  final String fileType;
  final double scale;

  const StitchPdfBadge({
    super.key,
    required this.fileType,
    this.scale = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final typeUpper = fileType.toUpperCase().replaceAll('.', '');

    final double size = 48.0 * scale;
    final double radius = AppTokens.radiusDefault * scale;
    final double iconSize = 20.0 * scale;

    if (typeUpper == 'PDF') {
      return Image.asset(
        'Icon/pdf-icon.webp',
        width: size + 2.0,
        height: size + 2.0,
        fit: BoxFit.contain,
      );
    }

    if (typeUpper == 'FOLDER') {
      return Container(
        width: size + 2.0,
        height: size + 2.0,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1B355A) : const Color(0xFFE8F0FE),
          borderRadius: BorderRadius.circular(radius),
        ),
        alignment: Alignment.center,
        child: Icon(
          Icons.folder,
          size: iconSize * 1.2,
          color: isDark ? const Color(0xFF8AB4F8) : const Color(0xFF1A73E8),
        ),
      );
    }

    if (typeUpper == 'DOC' || typeUpper == 'DOCX' || typeUpper == 'WORD') {
      return Image.asset(
        'Icon/msword-svg.webp',
        width: size + 2.0,
        height: size + 2.0,
        fit: BoxFit.contain,
      );
    }

    if (typeUpper == 'XLS' || typeUpper == 'XLSX' || typeUpper == 'EXCEL') {
      return Image.asset(
        'Icon/ms-excel.webp',
        width: size + 2.0,
        height: size + 2.0,
        fit: BoxFit.contain,
      );
    }

    if (typeUpper == 'PPT' || typeUpper == 'PPTX' || typeUpper == 'POWERPOINT') {
      return Image.asset(
        'Icon/PPT.webp',
        width: size + 2.0,
        height: size + 2.0,
        fit: BoxFit.contain,
      );
    }

    IconData icon = Icons.insert_drive_file;
    Color iconColor = theme.colorScheme.onSecondaryContainer;
    Color bgColor = isDark ? const Color(0xFF161616) : theme.colorScheme.secondaryContainer;

    return Container(
      width: size + 2.0,
      height: size + 2.0,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(radius),
      ),
      alignment: Alignment.center,
      child: Icon(
        icon,
        size: iconSize,
        color: iconColor,
      ),
    );
  }
}
