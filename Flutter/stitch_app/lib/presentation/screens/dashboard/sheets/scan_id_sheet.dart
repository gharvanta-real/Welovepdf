import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showScanIDSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulScanIDSheet();
    },
  );
}

class _StatefulScanIDSheet extends StatefulWidget {
  const _StatefulScanIDSheet();

  @override
  State<_StatefulScanIDSheet> createState() => _StatefulScanIDSheetState();
}

class _StatefulScanIDSheetState extends State<_StatefulScanIDSheet> {
  int _step = 1;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
      ),
      padding: EdgeInsets.only(
        left: AppTokens.containerPadding,
        right: AppTokens.containerPadding,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppTokens.containerPadding,
        top: AppTokens.containerPadding,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          buildSheetHeader(context, 'Scan Double-Sided ID Card'),
          if (_step == 1 && !_isLoading) ...[
            const Text('Step 1: Scan front side of your ID card.'),
            const SizedBox(height: AppTokens.gutter),
            Container(
              height: 140,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF161616) : const Color(0xFFE6F6FF),
                borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                border: Border.all(color: theme.colorScheme.secondary),
              ),
              child: const Center(child: Text('Camera Viewfinder Front Outline')),
            ),
            const SizedBox(height: AppTokens.gutter),
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Capture Front Side',
              onPressed: () => setState(() => _step = 2),
            ),
          ] else if (_step == 2 && !_isLoading) ...[
            const Text('Step 2: Flip card and scan back side.'),
            const SizedBox(height: AppTokens.gutter),
            Container(
              height: 140,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF161616) : const Color(0xFFE6F6FF),
                borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                border: Border.all(color: theme.colorScheme.secondary),
              ),
              child: const Center(child: Text('Camera Viewfinder Back Outline')),
            ),
            const SizedBox(height: AppTokens.gutter),
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Capture Back Side',
              onPressed: () {
                setState(() => _isLoading = true);
                Future.delayed(const Duration(seconds: 1), () {
                  state.addUploadedDocument('ID_Card_Scan', 'pdf', '1.8 MB');
                  setState(() {
                    _isLoading = false;
                    _step = 3;
                  });
                });
              },
            ),
          ] else if (_isLoading) ...[
            const Center(child: CircularProgressIndicator()),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(child: Text('ID Card scanned successfully!')),
            const SizedBox(height: AppTokens.gutter),
            StitchButton(
              type: StitchButtonType.ghost,
              text: 'Close',
              onPressed: () => Navigator.pop(context),
            ),
          ],
          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
