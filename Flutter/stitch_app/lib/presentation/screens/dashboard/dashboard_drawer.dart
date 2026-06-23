import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../state/app_state.dart';

class DashboardDrawer extends StatelessWidget {
  const DashboardDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final state = Provider.of<AppState>(context);
    final isDark = theme.brightness == Brightness.dark;

    final drawerBgColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;

    return Drawer(
      backgroundColor: drawerBgColor,
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: theme.colorScheme.error,
            ),
            accountName: Text(
              state.isLoggedIn ? (state.userName ?? 'PDFmount User') : 'PDFmount Guest',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: isDark ? Colors.black : Colors.white,
              ),
            ),
            accountEmail: Text(
              state.isLoggedIn ? (state.userEmail ?? 'user@pdfmount.com') : 'Log in to sync files',
              style: TextStyle(
                color: isDark ? Colors.black54 : Colors.white70,
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              child: Text(
                state.isLoggedIn
                    ? (state.userName != null && state.userName!.isNotEmpty
                        ? state.userName!.split(' ').map((e) => e[0]).take(2).join('').toUpperCase()
                        : 'U')
                    : 'G',
                style: TextStyle(
                  color: isDark ? Colors.white : theme.colorScheme.error,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.folder_shared),
            title: const Text('My Folders'),
            onTap: () {
              Navigator.pop(context);
              state.setBottomNavIndex(0);
            },
          ),
          ListTile(
            leading: const Icon(Icons.grid_view),
            title: const Text('Document Tools'),
            onTap: () {
              Navigator.pop(context);
              state.setBottomNavIndex(2);
            },
          ),
          ListTile(
            leading: const Icon(Icons.favorite),
            title: const Text('Starred Files'),
            onTap: () {
              Navigator.pop(context);
              state.setBottomNavIndex(3);
            },
          ),
          ListTile(
            leading: const Icon(Icons.storage),
            title: const Text('Storage Usage'),
            subtitle: const Text('15.2 MB of 100 GB'),
            onTap: () {
              Navigator.pop(context);
              state.setBottomNavIndex(4);
            },
          ),
          ListTile(
            leading: const Icon(Icons.sync_alt_rounded),
            title: const Text('Uploads & Operations'),
            onTap: () {
              Navigator.pop(context);
              state.setBottomNavIndex(5);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.delete_outline),
            title: const Text('Recycle Bin'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.error.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '0',
                style: TextStyle(color: theme.colorScheme.error, fontWeight: FontWeight.bold),
              ),
            ),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Recycle Bin is currently empty.')),
              );
            },
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(AppTokens.gutter),
            child: Text(
              'PDFmount v1.0.0 (Release)',
              style: TextStyle(color: theme.colorScheme.outline, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
