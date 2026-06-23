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
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.asset(
          'Icon/pdf-icon.webp',
          width: size,
          height: size,
          fit: BoxFit.cover,
        ),
      );
    }

    if (typeUpper == 'FOLDER') {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF3E2C00) : const Color(0xFFFFF3CD),
          borderRadius: BorderRadius.circular(radius),
        ),
        alignment: Alignment.center,
        child: Icon(
          Icons.folder,
          size: iconSize * 1.2,
          color: isDark ? Colors.amber.shade300 : Colors.amber.shade800,
        ),
      );
    }

    if (typeUpper == 'DOC' || typeUpper == 'DOCX' || typeUpper == 'WORD') {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.asset(
          'Icon/msword-svg.webp',
          width: size,
          height: size,
          fit: BoxFit.cover,
        ),
      );
    }

    if (typeUpper == 'XLS' || typeUpper == 'XLSX' || typeUpper == 'EXCEL') {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.asset(
          'Icon/ms-excel.webp',
          width: size,
          height: size,
          fit: BoxFit.cover,
        ),
      );
    }

    if (typeUpper == 'PPT' || typeUpper == 'PPTX' || typeUpper == 'POWERPOINT') {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.asset(
          'Icon/PPT.webp',
          width: size,
          height: size,
          fit: BoxFit.cover,
        ),
      );
    }

    IconData icon = Icons.insert_drive_file;
    Color iconColor = theme.colorScheme.onSecondaryContainer;
    Color bgColor = isDark ? const Color(0xFF161616) : theme.colorScheme.secondaryContainer;

    return Container(
      width: size,
      height: size,
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
