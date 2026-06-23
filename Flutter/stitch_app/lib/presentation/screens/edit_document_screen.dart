import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_tokens.dart';
import '../components/stitch_button.dart';
import '../components/stitch_drawing_painter.dart';
import '../state/app_state.dart';

class EditDocumentScreen extends StatefulWidget {
  const EditDocumentScreen({super.key});

  @override
  State<EditDocumentScreen> createState() => _EditDocumentScreenState();
}

class _EditDocumentScreenState extends State<EditDocumentScreen> {
  final List<List<Offset>> _lines = [];
  final List<List<Offset>> _signatureLines = [];
  
  bool _isSignatureSheetOpen = false;
  String _activeTool = 'Stylus'; // Stylus, Highlight, Text, Signature
  Color _strokeColor = Colors.black;
  double _strokeWidth = 3.0;

  String _textAnnotation = "";
  Offset _textOffset = const Offset(100, 100);

  void _clearCanvas() => setState(() { _lines.clear(); _textAnnotation = ""; });
  void _clearSignatureCanvas() => setState(() => _signatureLines.clear());
  void _showSignaturePad(BuildContext context) => setState(() { _isSignatureSheetOpen = true; _signatureLines.clear(); });

  void _showTextBottomSheet(BuildContext context) {
    final textController = TextEditingController(text: _textAnnotation);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
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
              Text(
                'Add Text Annotation',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: AppTokens.gutter),
              TextField(
                controller: textController,
                decoration: const InputDecoration(
                  hintText: 'Enter your text annotation',
                ),
                autofocus: true,
              ),
              const SizedBox(height: AppTokens.stackLg),
              Row(
                children: [
                  Expanded(
                    child: StitchButton(
                      type: StitchButtonType.ghost,
                      text: 'Cancel',
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: AppTokens.gutter),
                  Expanded(
                    child: StitchButton(
                      type: StitchButtonType.primary,
                      text: 'Apply',
                      onPressed: () {
                        if (textController.text.isNotEmpty) {
                          setState(() {
                            _textAnnotation = textController.text;
                            _textOffset = const Offset(100, 150);
                            _activeTool = 'Text';
                          });
                        }
                        Navigator.pop(context);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTokens.stackLg),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final docTitle = state.selectedDocument?.title ?? 'Edit Document.pdf';

    final appBarFgColor = theme.appBarTheme.foregroundColor ?? (isDark ? Colors.black : Colors.white);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: theme.colorScheme.error,
        statusBarIconBrightness: isDark ? Brightness.dark : Brightness.light,
        statusBarBrightness: isDark ? Brightness.light : Brightness.dark,
        systemNavigationBarColor: theme.colorScheme.surface,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: theme.colorScheme.error,
          leading: IconButton(
            onPressed: () {
              state.goBack();
            },
            icon: Icon(Icons.close, color: appBarFgColor),
          ),
          title: Text(
            docTitle,
            style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: appBarFgColor),
          ),
          actions: [
            IconButton(
              onPressed: _clearCanvas,
              icon: Icon(Icons.undo, color: appBarFgColor),
            ),
            IconButton(
              onPressed: () {},
              icon: Icon(Icons.redo, color: appBarFgColor),
            ),
            TextButton(
              onPressed: () {
                state.goBack();
              },
              child: Text(
                'Save',
                style: TextStyle(
                  color: appBarFgColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
        body: Stack(
          children: [
            Positioned.fill(
              child: Container(
                color: isDark ? const Color(0xFF0A0A0A) : const Color(0xFFC0DFEE).withOpacity(0.5),
              ),
            ),

            Center(
              child: Container(
                width: 320,
                height: 450,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                  borderRadius: BorderRadius.circular(AppTokens.radiusDefault),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                  ),
                  boxShadow: const [AppTokens.shadowLevel2],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppTokens.radiusDefault),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: Opacity(
                          opacity: 0.8,
                          child: Image.network(
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAH2VLdur5vnNmxfu37gplsIGvXkC9Ap0iQE1khJ3AoZLJpgfXOiXmleH1FftYhFvEYFeklgzCv4B0f3C1r2cA4PlOkSdtSQRpddvGn1cmNUU4nJWc6q86wsTbKZc_3X3rQzalw95qj_H7gMWEBiiZYepSQaeV4v3Y4chjUBFRrHs_o4x11SFk_qkmLWTqYz2dkirdDaC_8z_pn7EpPe4txQ4JgDatF_Z7sVYWU-vuSMsBDe945tFEPR8-XYoVOG4-L_57uMbdqDI2W',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned.fill(
                        child: GestureDetector(
                          onPanStart: (details) {
                            RenderBox renderBox = context.findRenderObject() as RenderBox;
                            Offset localPos = renderBox.globalToLocal(details.globalPosition);
                            Offset canvasPos = Offset(localPos.dx - (renderBox.size.width - 320) / 2, localPos.dy - (renderBox.size.height - 450) / 2);
                            
                            setState(() {
                              _lines.add([canvasPos]);
                            });
                          },
                          onPanUpdate: (details) {
                            RenderBox renderBox = context.findRenderObject() as RenderBox;
                            Offset localPos = renderBox.globalToLocal(details.globalPosition);
                            Offset canvasPos = Offset(localPos.dx - (renderBox.size.width - 320) / 2, localPos.dy - (renderBox.size.height - 450) / 2);
                            
                            setState(() {
                              if (_lines.isNotEmpty) {
                                _lines.last.add(canvasPos);
                              }
                            });
                          },
                          child: CustomPaint(
                            painter: StitchDrawingPainter(
                              lines: _lines,
                              strokeColor: _strokeColor,
                              strokeWidth: _strokeWidth,
                            ),
                            child: Container(),
                          ),
                        ),
                      ),
                      if (_textAnnotation.isNotEmpty)
                        Positioned(
                          left: _textOffset.dx,
                          top: _textOffset.dy,
                          child: GestureDetector(
                            onPanUpdate: (details) {
                              setState(() {
                                _textOffset += details.delta;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(AppTokens.base),
                              decoration: BoxDecoration(
                                color: Colors.yellow.withOpacity(0.8),
                                borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                              ),
                              child: Text(
                                _textAnnotation,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Toolbar dock
            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 500),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTokens.gutter,
                    vertical: AppTokens.base * 1.5,
                  ),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E1E1E).withOpacity(0.9) : Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                    boxShadow: const [AppTokens.shadowLevel2],
                    border: Border.all(
                      color: theme.colorScheme.outlineVariant.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildToolIcon(context, 'Stylus', Icons.edit, () {
                        setState(() {
                          _activeTool = 'Stylus';
                          _strokeColor = isDark ? Colors.white : Colors.black;
                          _strokeWidth = 3.0;
                        });
                      }),
                      _buildToolIcon(context, 'Highlight', Icons.border_color, () {
                        setState(() {
                          _activeTool = 'Highlight';
                          _strokeColor = Colors.yellow.withOpacity(0.5);
                          _strokeWidth = 15.0;
                        });
                      }),
                      _buildToolIcon(context, 'Text', Icons.title, () {
                        _showTextBottomSheet(context);
                      }),
                      _buildToolIcon(context, 'Signature', Icons.assignment_turned_in, () {
                        _showSignaturePad(context);
                      }),
                    ],
                  ),
                ),
              ),
            ),

            if (_isSignatureSheetOpen) ...[
              Positioned.fill(
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _isSignatureSheetOpen = false;
                    });
                  },
                  child: Container(
                    color: Colors.black45,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(AppTokens.radiusXl),
                    ),
                    boxShadow: const [AppTokens.shadowLevel2],
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Add Digital Signature',
                            style: theme.textTheme.headlineMedium?.copyWith(
                              color: theme.colorScheme.onSurface,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextButton(
                            onPressed: _clearSignatureCanvas,
                            child: const Text('Clear'),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppTokens.stackMd),
                      Container(
                        height: 180,
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF282828) : const Color(0xFFF4FAFF),
                          borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                          border: Border.all(
                            color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                          ),
                        ),
                        child: GestureDetector(
                          onPanStart: (details) {
                            RenderBox renderBox = context.findRenderObject() as RenderBox;
                            Offset localPos = renderBox.globalToLocal(details.globalPosition);
                            Offset padPos = Offset(localPos.dx - AppTokens.containerPadding, localPos.dy - (renderBox.size.height - 180 - AppTokens.containerPadding - 50));
                            setState(() {
                              _signatureLines.add([padPos]);
                            });
                          },
                          onPanUpdate: (details) {
                            RenderBox renderBox = context.findRenderObject() as RenderBox;
                            Offset localPos = renderBox.globalToLocal(details.globalPosition);
                            Offset padPos = Offset(localPos.dx - AppTokens.containerPadding, localPos.dy - (renderBox.size.height - 180 - AppTokens.containerPadding - 50));
                            setState(() {
                              if (_signatureLines.isNotEmpty) {
                                _signatureLines.last.add(padPos);
                              }
                            });
                          },
                          child: CustomPaint(
                            painter: StitchDrawingPainter(
                              lines: _signatureLines,
                              strokeColor: theme.colorScheme.primary,
                              strokeWidth: 4.0,
                            ),
                            child: Container(),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppTokens.stackLg),
                      Row(
                        children: [
                          Expanded(
                            child: StitchButton(
                              type: StitchButtonType.ghost,
                              text: 'Cancel',
                              onPressed: () {
                                setState(() {
                                  _isSignatureSheetOpen = false;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: AppTokens.gutter),
                          Expanded(
                            child: StitchButton(
                              type: StitchButtonType.primary,
                              text: 'Apply',
                              onPressed: () {
                                setState(() {
                                  _isSignatureSheetOpen = false;
                                  for (var line in _signatureLines) {
                                    final List<Offset> repositionedLine = line.map((p) {
                                      return Offset(p.dx + 50, p.dy + 200);
                                    }).toList();
                                    _lines.add(repositionedLine);
                                  }
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildToolIcon(
      BuildContext context, String toolName, IconData icon, VoidCallback onTap) {
    final theme = Theme.of(context);
    final isActive = _activeTool == toolName;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(AppTokens.base * 1.5),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isActive
              ? theme.colorScheme.error.withOpacity(0.15)
              : Colors.transparent,
        ),
        child: Icon(
          icon,
          color: isActive ? theme.colorScheme.error : theme.colorScheme.secondary,
          size: 24,
        ),
      ),
    );
  }
}
