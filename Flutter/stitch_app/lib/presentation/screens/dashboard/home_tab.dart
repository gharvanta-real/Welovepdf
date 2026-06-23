import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../data/models/document.dart';
import '../../components/stitch_card.dart';
import '../../state/app_state.dart';
import 'sheets/dashboard_sheets.dart';
import 'tools_sheets.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return RefreshIndicator(
      color: theme.colorScheme.error,
      onRefresh: () async {
        await Future.delayed(const Duration(milliseconds: 500));
      },
      child: Column(
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
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top section: Quick Tools inside the card
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppTokens.containerPadding,
                        24,
                        AppTokens.containerPadding,
                        0,
                      ),
                      child: _buildQuickToolsSection(context, state),
                    ),
                    const SizedBox(height: AppTokens.stackLg),

                    // Bottom Section: Files list
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTokens.containerPadding,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Breadcrumbs (visible when inside a folder)
                          _buildBreadcrumbs(context, state),

                          // Recent Files section (fills the rest of the sheet)
                          _buildRecentFilesSection(context, state),
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
    );
  }




  // ── Quick Tools 2×4 Grid ───────────────────────────────────────────────────
  Widget _buildQuickToolsSection(BuildContext context, AppState state) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final List<Map<String, dynamic>> quickTools = [
      {
        'label': 'Merge\nPDF',
        'icon': Icons.merge_type_rounded,
        'onTap': (ctx) => showMergeSheet(ctx),
      },
      {
        'label': 'Compress\nPDF',
        'icon': Icons.compress_rounded,
        'onTap': (ctx) => showCompressSheet(ctx),
      },
      {
        'label': 'Split\nPDF',
        'icon': Icons.call_split_rounded,
        'onTap': (ctx) => showSplitSheet(ctx),
      },
      {
        'label': 'Word\nto PDF',
        'icon': Icons.description_outlined,
        'onTap': (ctx) => showWordToPdfSheet(ctx),
      },
      {
        'label': 'Photos\nto PDF',
        'icon': Icons.add_photo_alternate_outlined,
        'onTap': (ctx) => showImageToPdfSheet(ctx),
      },
      {
        'label': 'Protect\nPDF',
        'icon': Icons.lock_outlined,
        'onTap': (ctx) => showProtectSheet(ctx),
      },
      {
        'label': 'Unlock\nPDF',
        'icon': Icons.lock_open_outlined,
        'onTap': (ctx) => showUnlockSheet(ctx),
      },
      {
        'label': 'Add\nWatermark',
        'icon': Icons.branding_watermark_outlined,
        'onTap': (ctx) => showWatermarkSheet(ctx),
      },
    ];

    final Color topSectionFgColor = theme.colorScheme.onSurface;
    final Color topSectionSeeAllColor = theme.colorScheme.error;
    final Color quickToolCircleBgColor = isDark ? const Color(0xFF282828) : const Color(0xFFE2EDF5);
    final Color quickToolIconColor = isDark ? Colors.white : theme.colorScheme.error;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Quick Tools',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: topSectionFgColor,
              ),
            ),
            GestureDetector(
              onTap: () => state.setBottomNavIndex(2),
              child: Row(
                children: [
                  Text(
                    'See All',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: topSectionSeeAllColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Icon(Icons.chevron_right,
                      color: topSectionSeeAllColor, size: 17),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTokens.stackMd),

        // 2 rows × 4 columns
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.80,
          ),
          itemCount: quickTools.length,
          itemBuilder: (context, index) {
            final tool = quickTools[index];
            return GestureDetector(
              onTap: () {
                HapticFeedback.mediumImpact();
                state.useTool(tool['label'].toString().replaceAll('\n', ' '));
                (tool['onTap'] as Function(BuildContext))(context);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: quickToolCircleBgColor,
                      shape: BoxShape.circle,
                      boxShadow: const [AppTokens.shadowLevel1],
                    ),
                    child: Icon(
                      tool['icon'] as IconData,
                      color: quickToolIconColor,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tool['label'] as String,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 10,
                      height: 1.25,
                      color: topSectionFgColor,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // ── Recent Files section ───────────────────────────────────────────────────
  Widget _buildRecentFilesSection(BuildContext context, AppState state) {
    final theme = Theme.of(context);
    final docs = state.homeDocuments;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  'Recent Files',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(width: 6),
                // Sort button
                GestureDetector(
                  onTap: () => showSortBottomSheet(context, state),
                  child: Icon(
                    Icons.sort_rounded,
                    color: theme.colorScheme.error,
                    size: 20,
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Showing all documents.')),
                );
              },
              child: Row(
                children: [
                  Text(
                    'See All',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: theme.colorScheme.error,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Icon(Icons.chevron_right,
                      color: theme.colorScheme.error, size: 17),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppTokens.stackMd),

        // Filter chips row
        _buildFilterChips(context, state),
        const SizedBox(height: AppTokens.stackMd),

        // Document list (now part of the single scrollable viewport)
        docs.isEmpty
            ? _buildEmptyState(context, 'No documents found')
            : ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: EdgeInsets.zero,
                itemCount: docs.length,
                separatorBuilder: (c, i) => Divider(
                  height: 12,
                  thickness: 0.8,
                  color: theme.colorScheme.outlineVariant.withOpacity(0.4),
                ),
                itemBuilder: (c, index) {
                  final doc = docs[index];
                  if (doc.fileType == 'folder') {
                    return _buildFolderDragTarget(context, doc, state);
                  } else {
                    return _buildFileDraggable(context, doc, state);
                  }
                },
              ),
      ],
    );
  }

  // ── Filter Chips ───────────────────────────────────────────────────────────
  Widget _buildFilterChips(BuildContext context, AppState state) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final filters = ['All', 'PDF', 'Word', 'Excel', 'PPT'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((filter) {
          final isSelected = state.activeFilter == filter;
          return Padding(
            padding: const EdgeInsets.only(right: AppTokens.base),
            child: GestureDetector(
              onTap: () => state.updateFilter(filter),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? theme.colorScheme.error
                      : (isDark
                          ? const Color(0xFF282828)
                          : const Color(0xFFE2EDF5)),
                  borderRadius:
                      BorderRadius.circular(AppTokens.radiusFull),
                  border: Border.all(
                    color: isSelected
                        ? theme.colorScheme.error
                        : Colors.transparent,
                  ),
                ),
                child: Text(
                  filter,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: isSelected
                        ? theme.colorScheme.onError
                        : theme.colorScheme.onSurfaceVariant,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Breadcrumbs (folder navigation) ───────────────────────────────────────
  Widget _buildBreadcrumbs(BuildContext context, AppState state) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final path = state.folderPath;

    if (state.currentFolderId == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: AppTokens.stackLg),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF282828) : const Color(0xFFF5F7F8),
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back, size: 18),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: () => state.closeCurrentFolder(),
            ),
            const SizedBox(width: 8),
            DragTarget<Document>(
              onWillAccept: (data) =>
                  data != null && data.parentFolderId != null,
              onAccept: (data) {
                state.moveDocument(data.id, null);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text('Moved "${data.title}" to Root.')),
                );
              },
              builder: (context, candidateData, rejectedData) {
                final isHovered = candidateData.isNotEmpty;
                return GestureDetector(
                  onTap: () => state.openFolder(null),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: isHovered
                          ? theme.colorScheme.secondary.withOpacity(0.15)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Root',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isHovered
                            ? theme.colorScheme.secondary
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                );
              },
            ),
            ...path.map((folder) {
              final isLast = folder.id == state.currentFolderId;
              return Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(Icons.chevron_right,
                        size: 14, color: Colors.grey),
                  ),
                  DragTarget<Document>(
                    onWillAccept: (data) =>
                        data != null &&
                        data.id != folder.id &&
                        data.parentFolderId != folder.id,
                    onAccept: (data) {
                      state.moveDocument(data.id, folder.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text(
                                'Moved "${data.title}" to "${folder.title}".')),
                      );
                    },
                    builder: (context, candidateData, rejectedData) {
                      final isHovered = candidateData.isNotEmpty;
                      return GestureDetector(
                        onTap: () => state.openFolder(folder.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 4),
                          decoration: BoxDecoration(
                            color: isHovered
                                ? theme.colorScheme.secondary
                                    .withOpacity(0.15)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            folder.title.replaceAll('/', ''),
                            style: TextStyle(
                              fontWeight: isLast
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              color: isLast
                                  ? theme.colorScheme.onSurface
                                  : (isHovered
                                      ? theme.colorScheme.secondary
                                      : theme.colorScheme.onSurfaceVariant),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  // ── Folder drag target card ────────────────────────────────────────────────
  Widget _buildFolderDragTarget(
      BuildContext context, Document folder, AppState state) {
    return DragTarget<Document>(
      onWillAccept: (data) =>
          data != null &&
          data.id != folder.id &&
          data.parentFolderId != folder.id,
      onAccept: (data) {
        state.moveDocument(data.id, folder.id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('Moved "${data.title}" to "${folder.title}".')),
        );
      },
      builder: (context, candidateData, rejectedData) {
        final isHovered = candidateData.isNotEmpty;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: isHovered
              ? BoxDecoration(
                  borderRadius:
                      BorderRadius.circular(AppTokens.radiusLg),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.withOpacity(0.3),
                      blurRadius: 8,
                      spreadRadius: 2,
                    ),
                  ],
                )
              : const BoxDecoration(),
          child: StitchCard(
            title: folder.title,
            dateAndSize:
                '${state.getAllFolderItemsCount(folder.id)} items',
            fileType: folder.fileType,
            isFavorite: folder.isFavorite,
            filePath: folder.filePath,
            onTap: () => state.openFolder(folder.id),
            onFavoriteToggle: (fav) =>
                state.toggleFavorite(folder.id),
            onMoreTap: () =>
                showDocumentOptionsBottomSheet(context, folder, state),
          ),
        );
      },
    );
  }

  // ── File draggable card ────────────────────────────────────────────────────
  Widget _buildFileDraggable(
      BuildContext context, Document file, AppState state) {
    return LongPressDraggable<Document>(
      data: file,
      maxSimultaneousDrags: 1,
      feedback: Material(
        color: Colors.transparent,
        child: Opacity(
          opacity: 0.8,
          child: SizedBox(
            width: MediaQuery.of(context).size.width -
                (AppTokens.containerPadding * 2),
            child: StitchCard(
              title: file.title,
              dateAndSize: '${file.addedDate} • ${file.size}',
              fileType: file.fileType,
              isFavorite: file.isFavorite,
              filePath: file.filePath,
              onTap: () {},
              onMoreTap: () {},
            ),
          ),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: StitchCard(
          title: file.title,
          dateAndSize: '${file.addedDate} • ${file.size}',
          fileType: file.fileType,
          isFavorite: file.isFavorite,
          filePath: file.filePath,
          onTap: () {},
          onMoreTap: () {},
        ),
      ),
      child: StitchCard(
        title: file.title,
        dateAndSize: '${file.addedDate} • ${file.size}',
        fileType: file.fileType,
        isFavorite: file.isFavorite,
        filePath: file.filePath,
        isProcessing: file.isProcessing,
        onTap: () {
          if (file.isProcessing) return;
          state.selectDocument(file);
          if (file.fileType.toLowerCase() == 'pdf') {
            state.setScreen(AppScreen.pdfViewer);
          } else {
            state.setScreen(AppScreen.fileDetails);
          }
        },
        onFavoriteToggle: file.isProcessing
            ? null
            : (fav) => state.toggleFavorite(file.id),
        onMoreTap: file.isProcessing
            ? () {}
            : () => showDocumentOptionsBottomSheet(context, file, state),
      ),
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  Widget _buildEmptyState(BuildContext context, String message) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.folder_open_outlined,
              size: 56,
              color:
                  theme.colorScheme.onSurfaceVariant.withOpacity(0.35),
            ),
            const SizedBox(height: AppTokens.stackMd),
            Text(
              message,
              style: theme.textTheme.bodyLarge?.copyWith(
                color:
                    theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
