import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';

import '../../core/theme/app_tokens.dart';
import '../state/app_state.dart';
import 'dashboard/sheets/dashboard_sheets.dart';
import '../../data/models/document.dart';

class PdfViewerScreen extends StatefulWidget {
  const PdfViewerScreen({super.key});

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  double _currentPage = 1.0;
  final ScrollController _scrollController = ScrollController();
  final ScrollController _thumbnailScrollController = ScrollController();
  final TransformationController _transformationController = TransformationController();

  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  List<int> _searchResults = [];
  int _currentResultIndex = -1;
  bool _showAllTools = false;

  final List<String> _pageImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDhX47lTA0qqANlaBdQQewpgpb5wzTwWAoT52jE4amC29rpLaZayFNgB_Bt33PoiAEUOWcmMxhWoemlZO0-I1qCgtfw6YApp9HPJn_odsqlbbfcLLnQPyw5ffFpYNGdwMzFwX2SyIcKdEl8kvXH0I6V-Ly5XVpxGjF9px0EGk5DDFOSII8E0nCdvfXhYlvvhqdg3uYYE0nwqkLhQdNtCBAcBhKWjsxJWUjXh9gaQqIyk7Dyk-UIJp40BAqO2DhRUM91SlUMSslbMz7',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAH2VLdur5vnNmxfu37gplsIGvXkC9Ap0iQE1khJ3AoZLJpgfXOiXmleH1FftYhFvEYFeklgzCv4B0f3C1r2cA4PlOkSdtSQRpddvGn1cmNUU4nJWc6q86wsTbKZc_3X3rQzalw95qj_H7gMWEBiiZYepSQaeV4v3Y4chjUBFRrHs_o4x11SFk_qkmLWTqYz2dkirdDaC_8z_pn7EpPe4txQ4JgDatF_Z7sVYWU-vuSMsBDe945tFEPR8-XYoVOG4-L_57uMbdqDI2W',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNk936nKQuFZ0Mtqx7_vmY8NiZ2asNelFZ4TGGn-J2T6UfMZSMhbouNwOIHHC8zJld_xMzSulA_Ejj8eFLd0WdzdzG5EfvyM6Q-Yk8zycHkJ4zi0CHsdenn_p8cWanmSxfE_HuDxsjdywAvV3tME2i8HA8VcF_IIZBbz87Ki1osfaZfYFSBwciw6heeRI26Hrs_Y7IbEd_G-_6_ScapgfrTYDsdzXYOi-0T4JWT94HffUTbU6Z70FIGqOdJqm1SF4A1229c4T29Ju1',
  ];

  final List<String> _pageTexts = [
    "PDFmount Document Editor User Manual. Table of Contents, Introduction, Setup instructions.",
    "Getting Started with PDFmount. System requirements: Windows 10/11, macOS, Android, iOS. Installation steps.",
    "How to use Tools: Merge, Split, Compress, Rotate. Detailed instructions on document assembly.",
    "Smart Utilities and Scanners: Scan QR code, Make QR code, Area Measure tool, and Word Counter.",
    "Advanced PDF Viewer Features: Text search, page thumbnails, zoom limits, document signing.",
    "Security & Privacy: Password protection (Protect PDF), unlocking (Unlock PDF), signature verification.",
    "Troubleshooting FAQ: Installation issues, connection errors with Rust backend API, SQLite database sync.",
    "Premium Subscription Details: Pricing plans, monthly vs annual billing, enterprise packages, customer support.",
    "Developer API integration guide. REST endpoints: /api/auth/register, /api/auth/login, /api/auth/logout.",
    "Credits and Acknowledgements. Google DeepMind team, Advanced Agentic Coding, Flutter packages used.",
    "Terms of Service and Privacy Policy. Data retention limits, cloud storage duration, encryption standards.",
    "Appendix: Key definitions, abbreviations, and list of supported file formats (docx, xlsx, pptx, jpg, png)."
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _thumbnailScrollController.dispose();
    _searchController.dispose();
    _searchFocusNode.dispose();
    _transformationController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.hasClients) {
      final double offset = _scrollController.offset;
      const double pageHeight = 360.0 + AppTokens.stackLg; // Height of card + separator
      final state = Provider.of<AppState>(context, listen: false);
      final doc = state.selectedDocument;
      final pagesCount = doc?.pagesCount ?? 12;

      setState(() {
        _currentPage = ((offset / pageHeight).round() + 1).toDouble().clamp(1.0, pagesCount.toDouble());
      });
      _syncThumbnailsScroll();
    }
  }

  void _syncThumbnailsScroll() {
    if (_thumbnailScrollController.hasClients) {
      const double thumbnailWidth = 62.0; // 54 width + 8 right margin
      final double targetOffset = (_currentPage - 1) * thumbnailWidth - (MediaQuery.of(context).size.width / 2) + (thumbnailWidth / 2);
      _thumbnailScrollController.animateTo(
        targetOffset.clamp(0.0, _thumbnailScrollController.position.maxScrollExtent),
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
      );
    }
  }

  void _scrollToPage(double page) {
    _resetZoom();
    setState(() {
      _currentPage = page;
    });
    if (_scrollController.hasClients) {
      const double pageHeight = 360.0 + AppTokens.stackLg;
      _scrollController.animateTo(
        (page - 1) * pageHeight,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Widget _buildPageContent(Document? doc, int index, String imgUrl, AppState state) {
    if (doc != null) {
      final cachedImages = state.getDocumentImages(doc.id);
      if (cachedImages != null && index < cachedImages.length) {
        final item = cachedImages[index];
        if (item is Uint8List) {
          return Image.memory(item, fit: BoxFit.contain);
        } else if (item is String && item.isNotEmpty) {
          if (!kIsWeb && File(item).existsSync()) {
            return Image.file(File(item), fit: BoxFit.contain);
          }
        }
      }

      if (!kIsWeb && doc.description.startsWith('image_paths:')) {
        final paths = doc.description.replaceFirst('image_paths:', '').split(',');
        if (index < paths.length && paths[index].isNotEmpty) {
          if (File(paths[index]).existsSync()) {
            return Image.file(File(paths[index]), fit: BoxFit.contain);
          }
        }
      }

      final extractedText = state.getDocumentPageText(doc.id, index);
      if (extractedText != null && extractedText.trim().isNotEmpty) {
        return _buildExtractedTextPage(extractedText);
      }
    }

    return Image.network(
      imgUrl,
      fit: BoxFit.cover,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return const Center(child: CircularProgressIndicator());
      },
      errorBuilder: (context, error, stackTrace) {
        return _buildOfflinePagePlaceholder(context, index, doc?.title ?? 'Document');
      },
    );
  }

  Widget _buildExtractedTextPage(String text) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFFAF9F6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              physics: const NeverScrollableScrollPhysics(),
              child: Text(
                text,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: 10,
                  height: 1.5,
                  fontFamily: 'Courier',
                  color: isDark ? Colors.grey[300] : Colors.black87,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _zoom(double factor) {
    final double currentScale = _transformationController.value.getMaxScaleOnAxis();
    double targetScale = (currentScale * factor).clamp(1.0, 4.0);
    setState(() {
      _transformationController.value = Matrix4.diagonal3Values(targetScale, targetScale, 1.0);
    });
  }

  void _resetZoom() {
    setState(() {
      _transformationController.value = Matrix4.identity();
    });
  }

  String _getPageText(int index, AppState state, Document? doc) {
    if (doc != null) {
      final text = state.getDocumentPageText(doc.id, index);
      if (text != null && text.trim().isNotEmpty) {
        return text;
      }
    }
    if (index >= 0 && index < _pageTexts.length) {
      return _pageTexts[index];
    }
    return 'Page ${index + 1} of document. This is simulated content for search verification.';
  }

  void _performSearch(String query) {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _currentResultIndex = -1;
      });
      return;
    }
    final state = Provider.of<AppState>(context, listen: false);
    final doc = state.selectedDocument;
    final pagesCount = doc?.pagesCount ?? 12;

    final List<int> matches = [];
    for (int i = 0; i < pagesCount; i++) {
      if (_getPageText(i, state, doc).toLowerCase().contains(query.toLowerCase())) {
        matches.add(i);
      }
    }

    setState(() {
      _searchResults = matches;
      if (matches.isNotEmpty) {
        _currentResultIndex = 0;
        _scrollToPage((matches[0] + 1).toDouble());
      } else {
        _currentResultIndex = -1;
      }
    });
  }

  void _nextMatch() {
    if (_searchResults.isEmpty) return;
    setState(() {
      _currentResultIndex = (_currentResultIndex + 1) % _searchResults.length;
      _scrollToPage((_searchResults[_currentResultIndex] + 1).toDouble());
    });
  }

  void _prevMatch() {
    if (_searchResults.isEmpty) return;
    setState(() {
      _currentResultIndex = (_currentResultIndex - 1 + _searchResults.length) % _searchResults.length;
      _scrollToPage((_searchResults[_currentResultIndex] + 1).toDouble());
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final doc = state.selectedDocument;
    final title = doc?.title ?? 'Document';
    final pagesCount = doc?.pagesCount ?? 12;

    const Color appBarFgColor = Colors.white;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: theme.colorScheme.error,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: theme.colorScheme.surface,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        appBar: _isSearching
            ? AppBar(
                backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                leading: IconButton(
                  onPressed: () {
                    setState(() {
                      _isSearching = false;
                      _searchController.clear();
                      _performSearch('');
                    });
                  },
                  icon: Icon(Icons.close, color: theme.colorScheme.onSurface),
                ),
                title: TextField(
                  controller: _searchController,
                  focusNode: _searchFocusNode,
                  style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 16),
                  decoration: InputDecoration(
                    hintText: 'Search in document...',
                    hintStyle: TextStyle(color: theme.colorScheme.outline, fontSize: 16),
                    border: InputBorder.none,
                  ),
                  onChanged: _performSearch,
                  onSubmitted: (_) => _nextMatch(),
                ),
                actions: [
                  if (_searchResults.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8.0),
                      child: Center(
                        child: Text(
                          '${_currentResultIndex + 1}/${_searchResults.length}',
                          style: TextStyle(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  IconButton(
                    onPressed: _prevMatch,
                    icon: Icon(Icons.keyboard_arrow_up, color: theme.colorScheme.onSurface),
                  ),
                  IconButton(
                    onPressed: _nextMatch,
                    icon: Icon(Icons.keyboard_arrow_down, color: theme.colorScheme.onSurface),
                  ),
                ],
              )
            : AppBar(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: appBarFgColor,
                leading: IconButton(
                  onPressed: () {
                    state.goBack();
                  },
                  icon: Icon(Icons.arrow_back, color: appBarFgColor),
                ),
                title: Text(
                  title,
                  style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: appBarFgColor),
                ),
                actions: [
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _isSearching = true;
                      });
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        _searchFocusNode.requestFocus();
                      });
                    },
                    icon: Icon(Icons.search, color: appBarFgColor),
                  ),
                  IconButton(
                    onPressed: () {
                      state.setScreen(AppScreen.editDocument);
                    },
                    icon: Icon(Icons.edit, color: appBarFgColor),
                  ),
                  IconButton(
                    onPressed: () {
                      if (doc != null) {
                        showDocumentOptionsBottomSheet(context, doc, state);
                      }
                    },
                    icon: Icon(Icons.more_vert, color: appBarFgColor),
                  ),
                ],
              ),
        body: Stack(
          children: [
            // Scrollable PDF pages
            Container(
              color: isDark ? const Color(0xFF121212) : const Color(0xFFC0DFEE).withOpacity(0.5),
              child: InteractiveViewer(
                transformationController: _transformationController,
                minScale: 1.0,
                maxScale: 4.0,
                child: ListView.separated(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(
                    AppTokens.gutter,
                    AppTokens.gutter * 2,
                    AppTokens.gutter,
                    220.0, // Extra bottom padding to clear the floating controls
                  ),
                  itemCount: pagesCount,
                  separatorBuilder: (c, i) => const SizedBox(height: AppTokens.stackLg),
                  itemBuilder: (c, index) {
                    final imgUrl = _pageImages[index % _pageImages.length];
                    final pageText = _getPageText(index, state, doc);
                    final query = _searchController.text.trim();
                    final isMatched = query.isNotEmpty && pageText.toLowerCase().contains(query.toLowerCase());

                    return Center(
                      child: Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxWidth: 500),
                        child: AspectRatio(
                          aspectRatio: 1 / 1.414, // standard A4 sheet ratio
                          child: Container(
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                              borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                              boxShadow: const [AppTokens.shadowLevel1],
                              border: Border.all(
                                color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                              ),
                            ),
                            child: Stack(
                              children: [
                                Positioned.fill(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                                    child: _buildPageContent(doc, index, imgUrl, state),
                                  ),
                                ),
                                Positioned(
                                  top: 12,
                                  right: 12,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppTokens.base,
                                      vertical: AppTokens.stackSm / 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: theme.colorScheme.error,
                                      borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                                    ),
                                    child: const Text(
                                      'PDF',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                if (isMatched)
                                  Positioned(
                                    left: 12,
                                    right: 12,
                                    bottom: 12,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: Colors.yellow.withOpacity(0.9),
                                        borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                                        border: Border.all(color: Colors.amber, width: 1.5),
                                        boxShadow: const [AppTokens.shadowLevel1],
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.search, size: 14, color: Colors.black87),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              'Matched: "$query"',
                                              style: const TextStyle(
                                                color: Colors.black87,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Right Side floating tool buttons (Annotations + Zoom Controls)
            Positioned(
              right: 16,
              top: 100,
              child: Column(
                children: [
                  _buildSideToolButton(context, Icons.gesture, () {
                    state.setScreen(AppScreen.editDocument);
                  }),
                  const SizedBox(height: AppTokens.stackMd),
                  _buildSideToolButton(context, Icons.border_color, () {
                    state.setScreen(AppScreen.editDocument);
                  }),
                  if (_showAllTools) ...[
                    const SizedBox(height: AppTokens.stackMd),
                    _buildSideToolButton(context, Icons.title, () {
                      state.setScreen(AppScreen.editDocument);
                    }),
                    const SizedBox(height: AppTokens.stackMd),
                    _buildSideToolButton(context, Icons.assignment, () {
                      state.setScreen(AppScreen.editDocument);
                    }),
                    const SizedBox(height: 16),
                    Container(
                      width: 32,
                      height: 1,
                      color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                    ),
                    const SizedBox(height: 16),
                    _buildSideToolButton(context, Icons.add, () {
                      _zoom(1.25);
                    }),
                    const SizedBox(height: AppTokens.stackMd),
                    _buildSideToolButton(context, Icons.remove, () {
                      _zoom(1 / 1.25);
                    }),
                    const SizedBox(height: AppTokens.stackMd),
                    _buildSideToolButton(context, Icons.restart_alt, () {
                      _resetZoom();
                    }),
                  ],
                  const SizedBox(height: AppTokens.stackMd),
                  _buildSideToolButton(
                    context,
                    _showAllTools ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    () {
                      setState(() {
                        _showAllTools = !_showAllTools;
                      });
                    },
                  ),
                ],
              ),
            ),

            // Bottom controls area (Page Thumbnails Ribbon + Scrubber)
            Positioned(
              bottom: 24,
              left: AppTokens.containerPadding,
              right: AppTokens.containerPadding,
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 550),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Thumbnails Ribbon
                      _buildThumbnailsRibbon(context, pagesCount, state, theme, isDark),
                      const SizedBox(height: 12),
                      
                      // Scrubber Widget
                      Container(
                        padding: const EdgeInsets.all(AppTokens.gutter),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E1E1E).withOpacity(0.9) : Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(AppTokens.radiusXl),
                          boxShadow: const [AppTokens.shadowLevel2],
                          border: Border.all(
                            color: theme.colorScheme.outlineVariant.withOpacity(0.3),
                          ),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      'PAGE',
                                      style: theme.textTheme.labelMedium?.copyWith(
                                        color: theme.colorScheme.secondary,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                    const SizedBox(width: AppTokens.base),
                                    Text(
                                      '${_currentPage.toInt()} ',
                                      style: theme.textTheme.headlineSmall?.copyWith(
                                        color: theme.colorScheme.onSurface,
                                      ),
                                    ),
                                    Text(
                                      'of $pagesCount',
                                      style: theme.textTheme.bodyMedium?.copyWith(
                                        color: theme.colorScheme.outline,
                                      ),
                                    ),
                                  ],
                                ),
                                if (pagesCount > 1)
                                  Row(
                                    children: [
                                      GestureDetector(
                                        onTap: () {
                                          if (_currentPage > 1) {
                                            _scrollToPage(_currentPage - 1);
                                          }
                                        },
                                        child: Icon(
                                          Icons.keyboard_arrow_up,
                                          color: theme.colorScheme.secondary,
                                        ),
                                      ),
                                      const SizedBox(width: AppTokens.base),
                                      GestureDetector(
                                        onTap: () {
                                          if (_currentPage < pagesCount) {
                                            _scrollToPage(_currentPage + 1);
                                          }
                                        },
                                        child: Icon(
                                          Icons.keyboard_arrow_down,
                                          color: theme.colorScheme.secondary,
                                        ),
                                      ),
                                    ],
                                  ),
                              ],
                            ),
                            if (pagesCount > 1) ...[
                              const SizedBox(height: AppTokens.stackSm),
                              Slider(
                                value: _currentPage,
                                min: 1.0,
                                max: pagesCount.toDouble(),
                                divisions: pagesCount - 1,
                                activeColor: theme.colorScheme.error,
                                inactiveColor: theme.colorScheme.secondaryContainer,
                                onChanged: (val) {
                                  _scrollToPage(val);
                                },
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),


          ],
        ),
      ),
    );
  }

  Widget _buildThumbnailsRibbon(BuildContext context, int pagesCount, AppState state, ThemeData theme, bool isDark) {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E).withOpacity(0.95) : Colors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(AppTokens.radiusLg),
        boxShadow: const [AppTokens.shadowLevel1],
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withOpacity(0.3),
        ),
      ),
      child: ListView.builder(
        controller: _thumbnailScrollController,
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        itemCount: pagesCount,
        itemBuilder: (context, index) {
          final int pageNum = index + 1;
          final bool isActive = _currentPage.toInt() == pageNum;
          final imgUrl = _pageImages[index % _pageImages.length];
          final doc = state.selectedDocument;

          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              _scrollToPage(pageNum.toDouble());
            },
            child: Container(
              width: 54,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                border: Border.all(
                  color: isActive ? theme.colorScheme.error : theme.colorScheme.outlineVariant.withOpacity(0.5),
                  width: isActive ? 2.5 : 1.0,
                ),
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppTokens.radiusSm - (isActive ? 2 : 1)),
                      child: _buildPageContent(doc, pageNum - 1, imgUrl, state),
                    ),
                  ),
                  Positioned(
                    bottom: 2,
                    left: 2,
                    right: 2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        '$pageNum',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSideToolButton(BuildContext context, IconData icon, VoidCallback onTap) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          shape: BoxShape.circle,
          boxShadow: const [AppTokens.shadowLevel1],
          border: Border.all(
            color: theme.colorScheme.outlineVariant.withOpacity(0.5),
          ),
        ),
        child: Icon(
          icon,
          color: theme.colorScheme.secondary,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildOfflinePagePlaceholder(BuildContext context, int pageIndex, String title) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [const Color(0xFF1E1E1E), const Color(0xFF121212)]
              : [const Color(0xFFF9FBFC), const Color(0xFFE8F1F5)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: isDark ? 0.04 : 0.08,
              child: CustomPaint(
                painter: _GridLinesPainter(lineColor: isDark ? Colors.white : Colors.black87),
              ),
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.error.withOpacity(0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.picture_as_pdf_rounded,
                    size: 48,
                    color: theme.colorScheme.error,
                  ),
                ),
                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Page ${pageIndex + 1}',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.secondary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: theme.colorScheme.secondary.withOpacity(0.15),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.cloud_off_rounded,
                        size: 12,
                        color: theme.colorScheme.secondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Offline Preview',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.secondary,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GridLinesPainter extends CustomPainter {
  final Color lineColor;
  _GridLinesPainter({required this.lineColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = lineColor
      ..strokeWidth = 1.0;
    
    final double startY = size.height * 0.2;
    final double spacing = 18.0;
    for (int i = 0; i < 6; i++) {
      final double y = startY + i * spacing;
      final double widthRatio = i % 2 == 0 ? 0.7 : 0.55;
      canvas.drawLine(
        Offset(size.width * 0.15, y),
        Offset(size.width * (0.15 + widthRatio * 0.7), y),
        paint,
      );
    }

    final double bottomStartY = size.height * 0.68;
    for (int i = 0; i < 4; i++) {
      final double y = bottomStartY + i * spacing;
      final double widthRatio = i % 2 == 0 ? 0.65 : 0.45;
      canvas.drawLine(
        Offset(size.width * 0.15, y),
        Offset(size.width * (0.15 + widthRatio * 0.7), y),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

