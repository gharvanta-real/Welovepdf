import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_tokens.dart';
import 'stitch_pdf_badge.dart';

class StitchCard extends StatefulWidget {
  final String title;
  final String dateAndSize;
  final String fileType;
  final bool isFavorite;
  final VoidCallback onTap;
  final VoidCallback onMoreTap;
  final ValueChanged<bool>? onFavoriteToggle;
  final bool isGrid;
  final String? filePath;

  const StitchCard({
    super.key,
    required this.title,
    required this.dateAndSize,
    required this.fileType,
    this.isFavorite = false,
    required this.onTap,
    required this.onMoreTap,
    this.onFavoriteToggle,
    this.isGrid = false,
    this.filePath,
  });

  @override
  State<StitchCard> createState() => _StitchCardState();
}

class _StitchCardState extends State<StitchCard> {
  late bool _fav;

  @override
  void initState() {
    super.initState();
    _fav = widget.isFavorite;
  }

  @override
  void didUpdateWidget(covariant StitchCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isFavorite != widget.isFavorite) {
      _fav = widget.isFavorite;
    }
  }

  void _toggleFavorite() {
    setState(() {
      _fav = !_fav;
    });
    HapticFeedback.mediumImpact();
    if (widget.onFavoriteToggle != null) {
      widget.onFavoriteToggle!(_fav);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final cardBgColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;

    if (widget.isGrid) {
      return GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          widget.onTap();
        },
        child: Container(
          decoration: BoxDecoration(
            color: cardBgColor,
            borderRadius: BorderRadius.circular(AppTokens.radiusLg),
            border: null,
            boxShadow: const [AppTokens.shadowLevel1],
          ),
          padding: const EdgeInsets.all(AppTokens.base * 1.5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail Representation (Real Image File or Badge Fallback)
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF161616) : const Color(0xFFE6F6FF),
                    borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                    child: widget.filePath != null && File(widget.filePath!).existsSync()
                        ? Image.file(
                            File(widget.filePath!),
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                          )
                        : Center(
                            child: StitchPdfBadge(fileType: widget.fileType, scale: 1.3),
                          ),
                  ),
                ),
              ),
              const SizedBox(height: AppTokens.stackMd),
              Text(
                widget.title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelLarge?.copyWith(
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: AppTokens.stackSm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      widget.dateAndSize,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: widget.onMoreTap,
                    child: Icon(
                      Icons.more_vert,
                      size: 20,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    // Horizontal List Style
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.transparent,
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 4,
          vertical: 10,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                child: widget.filePath != null && File(widget.filePath!).existsSync()
                    ? Image.file(
                        File(widget.filePath!),
                        fit: BoxFit.cover,
                        width: 48,
                        height: 48,
                      )
                    : StitchPdfBadge(fileType: widget.fileType),
              ),
            ),
            const SizedBox(width: AppTokens.gutter),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: AppTokens.stackSm),
                  Text(
                    widget.dateAndSize,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.outline,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppTokens.base),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.fileType != 'folder')
                  GestureDetector(
                    onTap: _toggleFavorite,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(AppTokens.base),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _fav
                            ? theme.colorScheme.error.withOpacity(0.1)
                            : Colors.transparent,
                      ),
                      child: Icon(
                        _fav ? Icons.favorite : Icons.favorite_border,
                        size: 20,
                        color: _fav
                            ? theme.colorScheme.error
                            : theme.colorScheme.outline,
                      ),
                    ),
                  ),
                GestureDetector(
                  onTap: widget.onMoreTap,
                  child: Padding(
                    padding: const EdgeInsets.all(AppTokens.base),
                    child: Icon(
                      Icons.more_vert,
                      size: 20,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
