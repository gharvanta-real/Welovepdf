import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../state/app_state.dart';
import 'tools_sheets.dart';

class ToolsTab extends StatelessWidget {
  const ToolsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      children: [
        Expanded(
          child: Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF121212) : Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppTokens.containerPadding,
              vertical: 24,
            ),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.only(bottom: 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Utilities & Scanners ─────────────────────────────────
                  _buildSectionHeader(context, 'Utilities & Scanners'),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildUtilitiesGrid(context),
                  const SizedBox(height: AppTokens.stackLg),

                  // ── Convert To ──────────────────────────────────────────
                  _buildSectionHeader(context, 'Convert To'),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildConvertToGrid(context),
                  const SizedBox(height: AppTokens.stackLg),

                  // ── Convert From ────────────────────────────────────────
                  _buildSectionHeader(context, 'Convert From'),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildConvertFromGrid(context),
                  const SizedBox(height: AppTokens.stackLg),

                  // ── Edit & Organize ─────────────────────────────────────
                  _buildSectionHeader(context, 'Edit & Organize'),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildEditOrganizeGrid(context),
                  const SizedBox(height: AppTokens.stackLg),

                  // ── View & Security ─────────────────────────────────────
                  _buildSectionHeader(context, 'View & Security'),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildViewSecurityGrid(context),
                  const SizedBox(height: AppTokens.stackLg),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }


  // ── Section header ─────────────────────────────────────────────────────────
  Widget _buildSectionHeader(BuildContext context, String title) {
    final theme = Theme.of(context);
    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
        color: theme.colorScheme.onSurface,
      ),
    );
  }

  // ── Convert To Grid ────────────────────────────────────────────────────────
  Widget _buildConvertToGrid(BuildContext context) {
    final tools = [
      _ToolItem(
        label: 'PDF to Word',
        sublabel: 'Convert PDF to\nWord document',
        assetPath: 'Icon/msword-svg.webp',
        badgeColor: const Color(0xFF2B5DB3),
        onTap: (ctx) => showPdfToOfficeSheet(ctx, 'Word'),
      ),
      _ToolItem(
        label: 'PDF to Excel',
        sublabel: 'Convert PDF to\nExcel sheet',
        assetPath: 'Icon/ms-excel.webp',
        badgeColor: const Color(0xFF1E7E34),
        onTap: (ctx) => showPdfToOfficeSheet(ctx, 'Excel'),
      ),
      _ToolItem(
        label: 'PDF to PPT',
        sublabel: 'Convert PDF to\nPowerPoint',
        assetPath: 'Icon/PPT.webp',
        badgeColor: const Color(0xFFD84315),
        onTap: (ctx) => showPdfToOfficeSheet(ctx, 'PPT'),
      ),
      _ToolItem(
        label: 'PDF to Image',
        sublabel: 'Convert PDF to\nJPG, PNG',
        icon: Icons.image_outlined,
        badgeColor: const Color(0xFF7B1FA2),
        onTap: (ctx) => showPdfToOfficeSheet(ctx, 'Image'),
      ),
    ];
    return _buildFourColGrid(context, tools);
  }

  // ── Convert From Grid ──────────────────────────────────────────────────────
  Widget _buildConvertFromGrid(BuildContext context) {
    final tools = [
      _ToolItem(
        label: 'Word to PDF',
        sublabel: 'Convert Word\nto PDF',
        assetPath: 'Icon/msword-svg.webp',
        badgeColor: const Color(0xFF2B5DB3),
        onTap: (ctx) => showWordToPdfSheet(ctx),
      ),
      _ToolItem(
        label: 'Excel to PDF',
        sublabel: 'Convert Excel\nto PDF',
        assetPath: 'Icon/ms-excel.webp',
        badgeColor: const Color(0xFF1E7E34),
        onTap: (ctx) => showOfficeToPdfSheet(ctx, 'Excel'),
      ),
      _ToolItem(
        label: 'PPT to PDF',
        sublabel: 'Convert\nPowerPoint to PDF',
        assetPath: 'Icon/PPT.webp',
        badgeColor: const Color(0xFFD84315),
        onTap: (ctx) => showOfficeToPdfSheet(ctx, 'PPT'),
      ),
      _ToolItem(
        label: 'Image to PDF',
        sublabel: 'Convert image\nto PDF',
        icon: Icons.image_outlined,
        badgeColor: const Color(0xFF1E7E34),
        onTap: (ctx) => showImageToPdfSheet(ctx),
      ),
    ];
    return _buildFourColGrid(context, tools);
  }

  // ── Edit & Organize Grid ───────────────────────────────────────────────────
  Widget _buildEditOrganizeGrid(BuildContext context) {
    final theme = Theme.of(context);
    final red = theme.colorScheme.error;

    final tools = [
      _ToolItem(
        label: 'Merge PDF',
        sublabel: 'Combine multiple\nPDF files',
        icon: Icons.merge_type_rounded,
        badgeColor: red,
        onTap: (ctx) => showMergeSheet(ctx),
      ),
      _ToolItem(
        label: 'Split PDF',
        sublabel: 'Split PDF into\nmultiple files',
        icon: Icons.call_split_rounded,
        badgeColor: red,
        onTap: (ctx) => showSplitSheet(ctx),
      ),
      _ToolItem(
        label: 'Compress PDF',
        sublabel: 'Reduce PDF\nfile size',
        icon: Icons.compress_rounded,
        badgeColor: red,
        onTap: (ctx) => showCompressSheet(ctx),
      ),
      _ToolItem(
        label: 'Rotate PDF',
        sublabel: 'Rotate PDF\npages easily',
        icon: Icons.rotate_right_rounded,
        badgeColor: red,
        onTap: (ctx) => showPageManipulationSheet(ctx, 'Rotate'),
      ),
      _ToolItem(
        label: 'Delete Pages',
        sublabel: 'Remove unwanted\npages from PDF',
        icon: Icons.delete_sweep_outlined,
        badgeColor: red,
        onTap: (ctx) => showPageManipulationSheet(ctx, 'Delete'),
      ),
      _ToolItem(
        label: 'Reorder Pages',
        sublabel: 'Rearrange pages\nin PDF',
        icon: Icons.swap_vert_rounded,
        badgeColor: red,
        onTap: (ctx) => showPageManipulationSheet(ctx, 'Reorder'),
      ),
      _ToolItem(
        label: 'Extract Pages',
        sublabel: 'Extract pages\nfrom PDF',
        icon: Icons.file_download_outlined,
        badgeColor: red,
        onTap: (ctx) => showPageManipulationSheet(ctx, 'Extract'),
      ),
      _ToolItem(
        label: 'Add Watermark',
        sublabel: 'Add text or image\nwatermark',
        icon: Icons.branding_watermark_outlined,
        badgeColor: red,
        onTap: (ctx) => showWatermarkSheet(ctx),
      ),
    ];
    return _buildFourColGrid(context, tools);
  }

  // ── View & Security Grid ───────────────────────────────────────────────────
  Widget _buildViewSecurityGrid(BuildContext context) {
    final theme = Theme.of(context);
    final red = theme.colorScheme.error;

    final tools = [
      _ToolItem(
        label: 'View PDF',
        sublabel: 'Open and view\nPDF files',
        icon: Icons.visibility_outlined,
        badgeColor: red,
        onTap: (ctx) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            const SnackBar(content: Text('Open a PDF file to view it')),
          );
        },
      ),
      _ToolItem(
        label: 'Protect PDF',
        sublabel: 'Password protect\nyour PDF',
        icon: Icons.lock_outlined,
        badgeColor: red,
        onTap: (ctx) => showProtectSheet(ctx),
      ),
      _ToolItem(
        label: 'Unlock PDF',
        sublabel: 'Remove password\nfrom PDF',
        icon: Icons.lock_open_outlined,
        badgeColor: red,
        onTap: (ctx) => showUnlockSheet(ctx),
      ),
    ];
    return _buildFourColGrid(context, tools);
  }

  // ── Utilities Grid ──────────────────────────────────────────────────────────
  Widget _buildUtilitiesGrid(BuildContext context) {
    final theme = Theme.of(context);
    final red = theme.colorScheme.error;

    final tools = [
      _ToolItem(
        label: 'Scan QR Code',
        sublabel: 'Scan QR with\nyour camera',
        icon: Icons.qr_code_scanner_rounded,
        badgeColor: red,
        onTap: (ctx) => showScanQRSheet(ctx),
      ),
      _ToolItem(
        label: 'Make QR Code',
        sublabel: 'Generate QR\nfrom link or text',
        icon: Icons.qr_code_rounded,
        badgeColor: red,
        onTap: (ctx) => showMakeQRSheet(ctx),
      ),
      _ToolItem(
        label: 'Area Measure',
        sublabel: 'Measure region\narea on document',
        icon: Icons.square_foot_rounded,
        badgeColor: red,
        onTap: (ctx) => showAreaMeasureSheet(ctx),
      ),
      _ToolItem(
        label: 'Word Counter',
        sublabel: 'Count words\nin your PDF file',
        icon: Icons.analytics_outlined,
        badgeColor: red,
        onTap: (ctx) => showWordCountSheet(ctx),
      ),
    ];
    return _buildFourColGrid(context, tools);
  }

  // ── Shared 4-column grid builder ───────────────────────────────────────────
  Widget _buildFourColGrid(BuildContext context, List<_ToolItem> tools) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 10,
        mainAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemCount: tools.length,
      itemBuilder: (context, index) {
        final tool = tools[index];
        return GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            final state = Provider.of<AppState>(context, listen: false);
            state.useTool(tool.label);
            tool.onTap(context);
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              // Icon/Badge container
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF1E1E1E)
                      : Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: const [AppTokens.shadowLevel1],
                  border: null,
                ),
                child: tool.assetPath != null
                    ? Center(
                        child: Image.asset(
                          tool.assetPath!,
                          width: 34,
                          height: 34,
                          fit: BoxFit.contain,
                        ),
                      )
                    : tool.badge != null
                        ? Center(
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: tool.badgeColor,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  tool.badge!,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                          )
                        : Icon(
                            tool.icon!,
                            color: tool.badgeColor,
                            size: 24,
                          ),
              ),
              const SizedBox(height: 6),
              // Label
              Text(
                tool.label,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 2),
              // Sublabel
              Text(
                tool.sublabel,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 9,
                  height: 1.2,
                  color: theme.colorScheme.onSurfaceVariant.withOpacity(0.75),
                ),
              ),
            ],
          ),
        );
      },
    );
  }


}

// ── Data class for tool items ──────────────────────────────────────────────
class _ToolItem {
  final String label;
  final String sublabel;
  final String? badge;
  final IconData? icon;
  final String? assetPath;
  final Color badgeColor;
  final void Function(BuildContext) onTap;

  const _ToolItem({
    required this.label,
    required this.sublabel,
    this.badge,
    this.icon,
    this.assetPath,
    required this.badgeColor,
    required this.onTap,
  }) : assert(badge != null || icon != null || assetPath != null,
            'Either badge, icon or assetPath must be provided');
}
