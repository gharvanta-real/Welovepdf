import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_tokens.dart';
import '../../state/app_state.dart';
import 'sheets/profile_sheets.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {

  void _showAboutDialog(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusXl)),
          title: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: theme.colorScheme.error,
                  borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                ),
                child: const Center(
                  child: Text(
                    'P',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(width: AppTokens.gutter),
              Text(
                'About PDFmount',
                style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'PDFmount Document Suite',
                style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: AppTokens.stackSm),
              Text('Version 1.0.0-release', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.outline)),
              const SizedBox(height: AppTokens.stackLg),
              Text(
                'PDFmount is an enterprise-grade document scanner and PDF editor. It provides pixel-perfect designs, advanced cropping, digital signatures, and fluid animations for high-efficiency corporate workflows.',
                style: theme.textTheme.bodyMedium?.copyWith(height: 1.4, color: theme.colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: AppTokens.stackLg),
              Text('Developed by Antigravity in pair-programming partnership.', style: theme.textTheme.bodySmall?.copyWith(fontStyle: FontStyle.italic)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Close', style: TextStyle(color: theme.colorScheme.error, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  void _showFAQs(BuildContext context) {
    showFAQs(context);
  }

  Future<void> _launchWebsite() async {
    final Uri url = Uri.parse('https://pdfmount.online/');
    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw Exception('Could not launch $url');
      }
    } catch (e) {
      await Clipboard.setData(const ClipboardData(text: 'https://pdfmount.online/'));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link. Copied website URL to clipboard!')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final favoriteCount = state.likedDocuments.length;

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
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildProfileContent(state, theme, isDark, favoriteCount),
                  const SizedBox(height: AppTokens.stackLg * 1.5),
                  _buildSettingsSection(state, theme, isDark),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProfileContent(AppState state, ThemeData theme, bool isDark, int favoriteCount) {
    final name = state.isLoggedIn ? (state.userName ?? 'PDFmount User') : 'Guest User';
    final email = state.isLoggedIn ? (state.userEmail ?? 'user@pdfmount.com') : 'Local Account';
    final initials = state.isLoggedIn && state.userName != null && state.userName!.isNotEmpty
        ? (state.userName!.split(' ').map((e) => e[0]).take(2).join('').toUpperCase())
        : 'G';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        CircleAvatar(
          radius: 48,
          backgroundColor: theme.colorScheme.primaryContainer,
          child: Text(
            initials,
            style: theme.textTheme.displayLarge?.copyWith(
              color: theme.colorScheme.onPrimaryContainer,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: AppTokens.stackMd),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              name,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            if (state.isLoggedIn) ...[
              const SizedBox(width: AppTokens.stackSm),
              Icon(Icons.stars, color: theme.colorScheme.error, size: 20),
            ],
          ],
        ),
        Text(
          email,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: AppTokens.stackLg * 1.5),
  
        Row(
          children: [
            Expanded(
              child: _buildStatCard(context, '${state.homeDocuments.length}', 'Total Files'),
            ),
            const SizedBox(width: AppTokens.gutter),
            Expanded(
              child: _buildStatCard(context, '$favoriteCount', 'Starred'),
            ),
            const SizedBox(width: AppTokens.gutter),
            Expanded(
              child: _buildStatCard(context, '36', 'Pages Read'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSettingsSection(AppState state, ThemeData theme, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            'App Settings',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: theme.colorScheme.onSurface,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: AppTokens.stackMd),
        Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: BorderRadius.circular(AppTokens.radiusLg),
            border: Border.all(
              color: theme.colorScheme.outlineVariant.withOpacity(0.3),
            ),
            boxShadow: const [AppTokens.shadowLevel1],
          ),
          child: Column(
            children: [
              ListTile(
                leading: Icon(Icons.help_outline, color: theme.colorScheme.secondary),
                title: Text(
                  'Help & FAQs',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => _showFAQs(context),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.privacy_tip_outlined, color: theme.colorScheme.secondary),
                title: Text(
                  'Privacy Policy',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => showPrivacyPolicy(context),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.description_outlined, color: theme.colorScheme.secondary),
                title: Text(
                  'Terms of Service',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => showTermsOfService(context),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.support_agent_outlined, color: theme.colorScheme.secondary),
                title: Text(
                  'Contact Support',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => showContactSupport(context),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.security_outlined, color: theme.colorScheme.secondary),
                title: Text(
                  'Privacy & Storage Controls',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => showPrivacyControls(context, state),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.info_outline, color: theme.colorScheme.secondary),
                title: Text(
                  'About PDFmount',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                subtitle: const Text('v1.0.0 (Release build)'),
                trailing: const Icon(Icons.keyboard_arrow_right),
                onTap: () => _showAboutDialog(context),
              ),
              const Divider(height: 1),
              ListTile(
                leading: Icon(Icons.language, color: theme.colorScheme.secondary),
                title: Text(
                  'Visit Website',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                subtitle: const Text('https://pdfmount.online/'),
                trailing: const Icon(Icons.open_in_new),
                onTap: _launchWebsite,
              ),
              if (state.isLoggedIn) ...[
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.logout, color: theme.colorScheme.error),
                  title: Text(
                    'Log Out',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.error,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  trailing: const Icon(Icons.keyboard_arrow_right, color: Colors.grey),
                  onTap: () async {
                    HapticFeedback.mediumImpact();
                    await state.logoutUser();
                  },
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String value, String label) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppTokens.gutter),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF282828) : const Color(0xFFE6F6FF),
        borderRadius: BorderRadius.circular(AppTokens.radiusLg),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.error,
            ),
          ),
          const SizedBox(height: AppTokens.stackSm),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.secondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
