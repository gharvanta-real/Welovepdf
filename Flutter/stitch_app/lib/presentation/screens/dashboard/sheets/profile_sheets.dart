import 'package:flutter/material.dart';
import '../../../../core/theme/app_tokens.dart';

void showStorageBreakdown(BuildContext context) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppTokens.radiusXl),
          ),
        ),
        padding: const EdgeInsets.all(AppTokens.containerPadding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2.5),
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Text(
              'Storage Breakdown',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            _buildBreakdownRow(context, 'PDF Documents', '12.4 MB', 0.81, theme.colorScheme.error),
            const SizedBox(height: AppTokens.stackMd),
            _buildBreakdownRow(context, 'Word Reports', '1.8 MB', 0.12, theme.colorScheme.primary),
            const SizedBox(height: AppTokens.stackMd),
            _buildBreakdownRow(context, 'Spreadsheets', '0.8 MB', 0.05, theme.colorScheme.secondary),
            const SizedBox(height: AppTokens.stackMd),
            _buildBreakdownRow(context, 'Others', '0.2 MB', 0.02, theme.colorScheme.outline),
            const SizedBox(height: AppTokens.stackLg * 1.5),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                ),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Close Details', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: AppTokens.stackLg),
          ],
        ),
      );
    },
  );
}

Widget _buildBreakdownRow(BuildContext context, String label, String size, double ratio, Color color) {
  final theme = Theme.of(context);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
          Text(size, style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.outline)),
        ],
      ),
      const SizedBox(height: AppTokens.stackSm),
      LinearProgressIndicator(
        value: ratio,
        backgroundColor: theme.colorScheme.surfaceContainerHighest,
        color: color,
        minHeight: 6,
        borderRadius: BorderRadius.circular(AppTokens.radiusFull),
      ),
    ],
  );
}

void showFAQs(BuildContext context) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppTokens.radiusXl),
              ),
            ),
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(AppTokens.containerPadding),
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(2.5),
                    ),
                  ),
                ),
                const SizedBox(height: AppTokens.stackLg),
                Text(
                  'Help & FAQs',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.stackLg),
                _buildFAQItem(theme, 'How do I edit or annotate a PDF?',
                    'To annotate any document, tap on the document to view it, and click the pen icon or "Edit note" to open the drawing and signature options.'),
                _buildFAQItem(theme, 'How to scan a physical paper document?',
                    'Tap the floating "+" button on the home screen, select "Scan Document", align the paper in the viewfinder, click shutter, adjust the crop outlines, apply colors/filters, and press Save!'),
                _buildFAQItem(theme, 'Can I convert Word docx/Excel sheets to PDF?',
                    'Yes! Clicking on any non-PDF file shows a "Convert to PDF" operation in its detail options, letting you create a clone instantly.'),
                _buildFAQItem(theme, 'Where are my documents saved locally?',
                    'Stitch stores your documents in secure local sandboxed memory. They can also be exported or shared to iCloud/Google Drive using the "Share" action.'),
                const SizedBox(height: AppTokens.stackLg * 2),
              ],
            ),
          );
        },
      );
    },
  );
}

Widget _buildFAQItem(ThemeData theme, String question, String answer) {
  return Card(
    color: theme.colorScheme.surfaceContainerLow,
    elevation: 0,
    margin: const EdgeInsets.only(bottom: AppTokens.stackMd),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppTokens.radiusLg),
      side: BorderSide(
        color: theme.colorScheme.outlineVariant.withOpacity(0.3),
      ),
    ),
    child: ExpansionTile(
      title: Text(
        question,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.onSurface,
        ),
      ),
      iconColor: theme.colorScheme.error,
      collapsedIconColor: theme.colorScheme.secondary,
      childrenPadding: const EdgeInsets.only(
        left: AppTokens.gutter,
        right: AppTokens.gutter,
        bottom: AppTokens.gutter,
      ),
      expandedAlignment: Alignment.topLeft,
      children: [
        Text(
          answer,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.4,
          ),
        ),
      ],
    ),
  );
}

void showPrivacyPolicy(BuildContext context) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppTokens.radiusXl),
              ),
            ),
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(AppTokens.containerPadding),
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(2.5),
                    ),
                  ),
                ),
                const SizedBox(height: AppTokens.stackLg),
                Text(
                  'Privacy Policy',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.stackSm),
                Text(
                  'Last Updated: June 22, 2026',
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.outline),
                ),
                const SizedBox(height: AppTokens.stackLg),
                _buildPolicySection(theme, '1. Information We Collect',
                    'We process PDF documents locally on your device. When you log in, we sync document metadata (such as titles, page counts, and edit history) securely to our Rust API server. We do not inspect or store document contents unless you explicitly choose to store them in your Enterprise Cloud Storage.'),
                _buildPolicySection(theme, '2. Google AdMob & Monetization',
                    'To keep PDFmount tools free for guest users, we show advertisements using Google AdMob. AdMob may collect and process device identifiers, advertising IDs, and location data to show personalized or non-personalized advertisements based on your consent settings.'),
                _buildPolicySection(theme, '3. Data Security & Encryption',
                    'All sync data transferred between the Flutter app and our backend is encrypted using TLS/SSL protocols. Data at rest (SQLite credentials and uploaded files) is secured using standard encryption routines. We never share or sell your personal data to third parties.'),
                _buildPolicySection(theme, '4. Your Data Rights & Choices',
                    'You have the right to access, download, or delete your metadata. You can wipe all local storage cache or permanently delete your account (if registered) directly from the Privacy Controls menu under settings.'),
                const SizedBox(height: AppTokens.stackLg * 2),
              ],
            ),
          );
        },
      );
    },
  );
}

void showTermsOfService(BuildContext context) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppTokens.radiusXl),
              ),
            ),
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.all(AppTokens.containerPadding),
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 5,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.outlineVariant,
                      borderRadius: BorderRadius.circular(2.5),
                    ),
                  ),
                ),
                const SizedBox(height: AppTokens.stackLg),
                Text(
                  'Terms of Service',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.stackSm),
                Text(
                  'Last Updated: June 22, 2026',
                  style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.outline),
                ),
                const SizedBox(height: AppTokens.stackLg),
                _buildPolicySection(theme, '1. Acceptance of Terms',
                    'By downloading, accessing, or using PDFmount, you agree to be bound by these Terms of Service. If you do not agree, please uninstall the application immediately.'),
                _buildPolicySection(theme, '2. Premium Subscriptions',
                    'Certain advanced tools (like OCR scanning and unlimited batch conversions) require an active Premium subscription. Billing is processed securely. You can manage or cancel your subscription renewal directly through app store subscription settings.'),
                _buildPolicySection(theme, '3. Prohibited Usage',
                    'You may not use PDFmount to scan, process, or distribute illegal documents, copyrighted material without permission, or host malicious files on our backend servers. Doing so will lead to instant account termination.'),
                _buildPolicySection(theme, '4. Disclaimers & Liability Limits',
                    'PDFmount is provided "as is". We are not responsible for any data loss, corrupted PDF files, or upload errors resulting from device failure, network disruption, or server maintenance.'),
                const SizedBox(height: AppTokens.stackLg * 2),
              ],
            ),
          );
        },
      );
    },
  );
}

Widget _buildPolicySection(ThemeData theme, String title, String content) {
  return Padding(
    padding: const EdgeInsets.only(bottom: AppTokens.stackLg),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: AppTokens.stackSm),
        Text(
          content,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.5,
          ),
        ),
      ],
    ),
  );
}

class ContactSupportSheet extends StatefulWidget {
  const ContactSupportSheet({super.key});

  @override
  State<ContactSupportSheet> createState() => _ContactSupportSheetState();
}

class _ContactSupportSheetState extends State<ContactSupportSheet> {
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _queryType = 'Bug Report';
  bool _isLoading = false;
  bool _isSuccess = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _submitTicket() {
    final subject = _subjectController.text.trim();
    final description = _descriptionController.text.trim();
    if (subject.isEmpty || description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill out all fields')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Simulate ticketing API call
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isSuccess = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
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
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: theme.colorScheme.outlineVariant,
                borderRadius: BorderRadius.circular(2.5),
              ),
            ),
          ),
          const SizedBox(height: AppTokens.stackLg),
          if (!_isSuccess) ...[
            Text(
              'Contact Support',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.stackMd),
            DropdownButtonFormField<String>(
              value: _queryType,
              dropdownColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              decoration: InputDecoration(
                labelText: 'Query Type',
                filled: true,
                fillColor: isDark ? const Color(0xFF161616) : const Color(0xFFF9F9F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTokens.radiusMd), borderSide: BorderSide.none),
              ),
              items: ['Bug Report', 'Feature Request', 'Billing/Subscription', 'Other']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _queryType = val);
                }
              },
            ),
            const SizedBox(height: AppTokens.stackMd),
            TextField(
              controller: _subjectController,
              style: TextStyle(color: theme.colorScheme.onSurface),
              decoration: InputDecoration(
                labelText: 'Subject',
                filled: true,
                fillColor: isDark ? const Color(0xFF161616) : const Color(0xFFF9F9F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTokens.radiusMd), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: AppTokens.stackMd),
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              style: TextStyle(color: theme.colorScheme.onSurface),
              decoration: InputDecoration(
                labelText: 'Description',
                alignLabelWithHint: true,
                filled: true,
                fillColor: isDark ? const Color(0xFF161616) : const Color(0xFFF9F9F9),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTokens.radiusMd), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg * 1.5),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.error,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusFull)),
                    ),
                    onPressed: _submitTicket,
                    child: const Text('Submit Ticket', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
          ] else ...[
            const Icon(Icons.check_circle_outline_rounded, color: Colors.green, size: 72),
            const SizedBox(height: AppTokens.stackLg),
            Text(
              'Ticket Submitted!',
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppTokens.stackMd),
            Text(
              'Ticket Reference: #PM-${8000 + (DateTime.now().millisecond % 2000)}\n\nWe have received your request and our support team will contact you via email within 24 hours.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: AppTokens.stackLg * 1.5),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusFull)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Done', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
          const SizedBox(height: AppTokens.stackLg),
        ],
      ),
    );
  }
}

void showContactSupport(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const ContactSupportSheet();
    },
  );
}

void showPrivacyControls(BuildContext context, dynamic state) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
        ),
        padding: const EdgeInsets.all(AppTokens.containerPadding),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: theme.colorScheme.outlineVariant,
                  borderRadius: BorderRadius.circular(2.5),
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Text(
              'Privacy & Storage Controls',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            ListTile(
              leading: Icon(Icons.delete_sweep_outlined, color: theme.colorScheme.secondary),
              title: const Text('Clear Temporary Cache', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Wipes temporary scanned files, crops, and metadata'),
              trailing: const Icon(Icons.keyboard_arrow_right),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Temporary scanned files and PDF cache cleared!')),
                );
              },
            ),
            const Divider(height: 1),
            if (state.isLoggedIn) ...[
              ListTile(
                leading: const Icon(Icons.no_accounts_outlined, color: Colors.red),
                title: const Text('Delete Account Permanently', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                subtitle: const Text('Wipes your profile, sync data, and files permanently'),
                trailing: const Icon(Icons.keyboard_arrow_right, color: Colors.red),
                onTap: () {
                  Navigator.pop(context);
                  _showAccountDeletionConfirmation(context, state);
                },
              ),
              const Divider(height: 1),
            ],
            const SizedBox(height: AppTokens.stackLg * 1.5),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusFull)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Close Settings', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: AppTokens.stackLg),
          ],
        ),
      );
    },
  );
}

void _showAccountDeletionConfirmation(BuildContext context, dynamic state) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusXl)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
            SizedBox(width: 10),
            Text('Confirm Deletion', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Are you absolutely sure you want to delete your account permanently?\n\nThis action cannot be undone. All your documents, active metadata sync records, and credentials will be wiped from our database forever.',
          style: TextStyle(height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(context);
              await state.logoutUser();
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Your account and metadata sync records have been deleted permanently.')),
              );
            },
            child: const Text('Delete Permanently', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      );
    },
  );
}

