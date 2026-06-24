
import 'dart:ui' show ImageFilter;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_tokens.dart';
import '../components/stitch_bottom_nav.dart';
import '../state/app_state.dart';
import 'dashboard/home_tab.dart';
import 'dashboard/recent_tab.dart';
import 'dashboard/tools_tab.dart';
import 'dashboard/liked_tab.dart';
import 'dashboard/profile_tab.dart';
import 'dashboard/operations_tab.dart';
import 'dashboard/dashboard_drawer.dart';
import 'dashboard/sheets/dashboard_sheets.dart';
import 'dashboard/sheets/image_to_pdf_sheet.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  bool _isMenuOpen = false;
  late AnimationController _menuController;
  late Animation<double> _menuAnimation;
  late Animation<double> _fabRotation;

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _menuController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );

    _menuAnimation = CurvedAnimation(
      parent: _menuController,
      curve: Curves.easeOutBack,
    );



    _fabRotation = Tween<double>(begin: 0.0, end: 0.125).animate(
      CurvedAnimation(parent: _menuController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _menuController.dispose();
    super.dispose();
  }

  void _toggleMenu() {
    HapticFeedback.mediumImpact();
    setState(() {
      _isMenuOpen = !_isMenuOpen;
      if (_isMenuOpen) {
        _menuController.forward();
      } else {
        _menuController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    const Color topAreaColor = Color(0xFF1A73E8);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: topAreaColor,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: theme.colorScheme.surface,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        key: _scaffoldKey,
        drawer: const DashboardDrawer(),
        backgroundColor: topAreaColor,
        body: Stack(
          children: [
            Column(
              children: [
                _buildAdaptiveHeader(context),
                Expanded(
                  child: _buildActiveTabBody(context),
                ),
              ],
            ),

            // Backdrop Blurred Dim Overlay
            if (_isMenuOpen)
              Positioned.fill(
                child: GestureDetector(
                  onTap: _toggleMenu,
                  child: ClipRect(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 3.0, sigmaY: 3.0),
                      child: Container(
                        color: Colors.black.withOpacity(0.35),
                      ),
                    ),
                  ),
                ),
              ),

            // Action menu options (Centered above FAB)
            if (_isMenuOpen)
              Positioned(
                bottom: 130,
                left: 0,
                right: 0,
                child: Center(
                  child: ScaleTransition(
                    scale: _menuAnimation,
                    alignment: Alignment.bottomCenter,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        _buildSproutItem(
                          context,
                          'Create Folder',
                          Icons.create_new_folder_rounded,
                          () {
                            _toggleMenu();
                            showCreateFolderBottomSheet(context, state);
                          },
                        ),
                        const SizedBox(height: AppTokens.gutter),
                        _buildSproutItem(
                          context,
                          'Images to PDF',
                          Icons.photo_library_rounded,
                          () {
                            _toggleMenu();
                            showImageToPdfSheet(context);
                          },
                        ),
                        const SizedBox(height: AppTokens.gutter),
                        _buildSproutItem(
                          context,
                          'Scan Document',
                          Icons.camera_alt_rounded,
                          () {
                            _toggleMenu();
                            state.startScanFlow(context);
                          },
                          isPrimary: true,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
        floatingActionButton: state.bottomNavIndex != 4
            ? GestureDetector(
                onTap: _toggleMenu,
                child: Stack(
                  alignment: Alignment.center,
                  clipBehavior: Clip.none,
                  children: [
                    // Semicircular cutout shadow (only bottom half is rendered)
                    ClipRect(
                      clipper: _BottomHalfClipper(),
                      child: Container(
                        width: 80, // 60 + 20 (spread of 10.0 on both sides)
                        height: 80,
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF121212) : const Color(0xFFF0F0F0),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    // Rotating FAB itself
                    RotationTransition(
                      turns: _fabRotation,
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.error,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.add,
                          color: theme.colorScheme.onError,
                          size: 32,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : null,
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        bottomNavigationBar: StitchBottomNav(
          currentIndex: state.bottomNavIndex,
          onTap: (index) {
            state.setBottomNavIndex(index);
          },
        ),
      ),
    );
  }

  Widget _buildAdaptiveHeader(BuildContext context) {
    final theme = Theme.of(context);
    final state = Provider.of<AppState>(context);

    final double statusBarHeight = MediaQuery.of(context).padding.top;
    final double topPadding = kIsWeb
        ? 8.0
        : (statusBarHeight > 0 ? statusBarHeight + 4.0 : 12.0);

    // Global topnav colors
    const Color headerColor = Color(0xFF1A73E8); // Same Cobalt Blue in both themes
    const Color headerFgColor = Colors.white; // White text/icons on the blue background
    final Color headerButtonBgColor = Colors.white.withOpacity(0.15);
    final Color headerMenuButtonBgColor = Colors.white.withOpacity(0.12);

    // Per-tab config
    String title = 'My Documents';
    String? subtitle;
    List<Widget> actions = [];

    switch (state.bottomNavIndex) {
      case 0:
        title = 'My Documents';
        subtitle = 'All your files in one place';
        actions = [
          // Circular search button
          GestureDetector(
            onTap: () => state.setScreen(AppScreen.search),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.search_rounded,
                  color: headerFgColor, size: 21),
            ),
          ),
          const SizedBox(width: 8),
          // Profile/Account button
          GestureDetector(
            onTap: () => state.setBottomNavIndex(4),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                color: headerFgColor,
                size: 21,
              ),
            ),
          ),
        ];
        break;
      case 1:
        title = 'Recent Documents';
        subtitle = null;
        actions = [
          // Profile/Account button
          GestureDetector(
            onTap: () => state.setBottomNavIndex(4),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                color: headerFgColor,
                size: 21,
              ),
            ),
          ),
        ];
        break;
      case 2:
        title = 'Tools';
        subtitle = 'Powerful tools to work with your documents';
        actions = [
          GestureDetector(
            onTap: () => state.setScreen(AppScreen.search),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.search_rounded,
                  color: headerFgColor, size: 21),
            ),
          ),
          const SizedBox(width: 8),
          // Profile/Account button
          GestureDetector(
            onTap: () => state.setBottomNavIndex(4),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                color: headerFgColor,
                size: 21,
              ),
            ),
          ),
        ];
        break;
      case 3:
        title = 'Files';
        subtitle = 'All your documents in one place';
        actions = [
          GestureDetector(
            onTap: () => state.setScreen(AppScreen.search),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.search_rounded,
                  color: headerFgColor, size: 21),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => showSortBottomSheet(context, state),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.tune_rounded,
                  color: headerFgColor, size: 20),
            ),
          ),
        ];
        break;
      case 4:
        title = 'My Profile';
        subtitle = null;
        actions = [];
        break;
      case 5:
        title = 'Operations';
        subtitle = 'Monitor background job status';
        actions = [];
        break;
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: headerColor,
      ),
      padding: EdgeInsets.only(
        top: topPadding,
        bottom: subtitle != null ? 14.0 : 12.0,
        left: AppTokens.gutter,
        right: AppTokens.gutter,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Hamburger menu
          GestureDetector(
            onTap: () => _scaffoldKey.currentState?.openDrawer(),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: headerMenuButtonBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.menu_rounded,
                  color: headerFgColor, size: 22),
            ),
          ),
          const SizedBox(width: AppTokens.stackMd),
          // Title + subtitle block
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    color: headerFgColor,
                    fontWeight: FontWeight.w800,
                    fontSize: kIsWeb ? 20.0 : 21.0,
                    letterSpacing: -0.3,
                  ),
                ),
                if (subtitle != null) ...
                  [
                    const SizedBox(height: 1),
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: headerFgColor.withOpacity(0.72),
                        fontSize: 11.5,
                      ),
                    ),
                  ],
              ],
            ),
          ),
          const SizedBox(width: AppTokens.stackMd),
          ...actions,
        ],
      ),
    );
  }

  Widget _buildActiveTabBody(BuildContext context) {
    final state = Provider.of<AppState>(context);

    switch (state.bottomNavIndex) {
      case 0:
        return const HomeTab();
      case 1:
        return const RecentTab();
      case 2:
        return const ToolsTab();
      case 3:
        return const LikedTab();
      case 4:
        return const ProfileTab();
      case 5:
        return const OperationsTab();
      default:
        return const HomeTab();
    }
  }


  Widget _buildSproutItem(
      BuildContext context, String label, IconData icon, VoidCallback onTap,
      {bool isPrimary = false}) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final btnBgColor = isPrimary
        ? theme.colorScheme.error
        : (isDark ? const Color(0xFF282828) : Colors.white);
    final fgColor = isPrimary ? theme.colorScheme.onError : theme.colorScheme.onSurface;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
        decoration: BoxDecoration(
          color: btnBgColor,
          borderRadius: BorderRadius.circular(AppTokens.radiusFull),
          boxShadow: const [AppTokens.shadowLevel2],
          border: Border.all(
            color: isDark
                ? const Color(0xFF2C2C2C)
                : const Color(0xFFC1C8C9).withOpacity(0.3),
            width: 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: fgColor, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: theme.textTheme.labelLarge?.copyWith(
                color: fgColor,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomHalfClipper extends CustomClipper<Rect> {
  @override
  Rect getClip(Size size) {
    return Rect.fromLTRB(0, size.height / 2, size.width, size.height);
  }

  @override
  bool shouldReclip(CustomClipper<Rect> oldClipper) => false;
}

