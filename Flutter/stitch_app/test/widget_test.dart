import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:stitch_app/main.dart';
import 'package:stitch_app/presentation/state/app_state.dart';

void main() {
  testWidgets('PDFmount onboarding screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppState(),
        child: const StitchApp(),
      ),
    );

    // Verify that the logo "Meet PDFmount" is shown
    expect(find.text('Meet PDFmount'), findsOneWidget);

    // Verify that "Manage documents easily" headline is shown
    expect(find.text('Manage documents easily'), findsOneWidget);

    // Verify that the "Get Started" button is present
    expect(find.text('Get Started'), findsOneWidget);
  });
}
