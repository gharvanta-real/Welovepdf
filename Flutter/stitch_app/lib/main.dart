import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'presentation/screens/onboarding_screen.dart';
import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/scan_preview_screen.dart';
import 'presentation/screens/pdf_viewer_screen.dart';
import 'presentation/screens/edit_document_screen.dart';
import 'presentation/screens/file_details_screen.dart';
import 'presentation/screens/search_screen.dart';
import 'presentation/state/app_state.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const StitchApp(),
    ),
  );
}

class StitchApp extends StatelessWidget {
  const StitchApp({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return MaterialApp(
      title: 'PDFmount',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: state.themeMode,
      home: const MainScreenRouter(),
    );
  }
}

class MainScreenRouter extends StatelessWidget {
  const MainScreenRouter({super.key});

  Widget _getScreenWidget(AppScreen screen) {
    switch (screen) {
      case AppScreen.onboarding:
        return const OnboardingScreen(key: ValueKey('onboarding'));
      case AppScreen.dashboard:
        return const DashboardScreen(key: ValueKey('dashboard'));
      case AppScreen.scanPreview:
        return const ScanPreviewScreen(key: ValueKey('scanPreview'));
      case AppScreen.pdfViewer:
        return const PdfViewerScreen(key: ValueKey('pdfViewer'));
      case AppScreen.editDocument:
        return const EditDocumentScreen(key: ValueKey('editDocument'));
      case AppScreen.fileDetails:
        return const FileDetailsScreen(key: ValueKey('fileDetails'));
      case AppScreen.search:
        return const SearchScreen(key: ValueKey('search'));
      default:
        return const OnboardingScreen(key: ValueKey('onboarding'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 280),
      switchInCurve: Curves.easeInOutCubic,
      switchOutCurve: Curves.easeInOutCubic,
      transitionBuilder: (Widget child, Animation<double> animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.03, 0.0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: _getScreenWidget(state.currentScreen),
    );
  }
}
