import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../data/models/document.dart';
import '../../components/stitch_card.dart';
import '../../state/app_state.dart';
import 'sheets/dashboard_sheets.dart';

class LikedTab extends StatefulWidget {
  const LikedTab({super.key});

  @override
  State<LikedTab> createState() => _LikedTabState();
}

class _LikedTabState extends State<LikedTab> {
  String _activeFilter = 'All';
  final List<String> _filters = ['All', 'PDF', 'Folders', 'Favorites'];

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Derive displayed docs based on filter
    final allDocs = state.allDocuments;
    final likedDocs = state.likedDocuments;

    final filteredDocs = () {
      switch (_activeFilter) {
        case 'PDF':
          return allDocs.where((d) => d.fileType.toLowerCase() == 'pdf').toList();
        case 'Folders':
          return allDocs.where((d) => d.fileType == 'folder').toList();
        case 'Favorites':
          return likedDocs;
        default:
          return allDocs;
      }
    }();

    final folders = allDocs.where((d) => d.fileType == 'folder').toList();

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
            padding: const EdgeInsets.fromLTRB(
              AppTokens.containerPadding,
              24,
              AppTokens.containerPadding,
              0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Filter chips ─────────────────────────────────────────
                _buildFilterChips(context, isDark),
                const SizedBox(height: AppTokens.stackLg),

                Expanded(
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.only(bottom: 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Folders section ───────────────────────────────────────
                        if (_activeFilter == 'All' || _activeFilter == 'Folders') ...[
                          _buildSectionRow(
                            context,
                            'Folders',
                            onSeeAll: () {
                              setState(() => _activeFilter = 'Folders');
                            },
                            seeAllLabel: 'View All',
                          ),
                          const SizedBox(height: AppTokens.stackMd),
                          if (folders.isEmpty)
                            _buildEmptyChip(context, 'No folders yet')
                          else
                            SizedBox(
                              height: 110,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                padding: EdgeInsets.zero,
                                itemCount: folders.length,
                                separatorBuilder: (_, __) =>
                                    const SizedBox(width: AppTokens.stackMd),
                                itemBuilder: (context, index) {
                                  final folder = folders[index];
                                  return _buildFolderTile(
                                      context, folder, state, isDark);
                                },
                              ),
                            ),
                          const SizedBox(height: AppTokens.stackLg),
                        ],

                        // ── Recent / Filtered Files section ───────────────────────
                        _buildSectionRow(
                          context,
                          _activeFilter == 'Favorites'
                              ? 'Starred Files'
                              : 'Recent Files',
                          onSeeAll: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Showing all files')),
                            );
                          },
                          seeAllLabel: 'View All',
                        ),
                        const SizedBox(height: AppTokens.stackMd),

                        filteredDocs.isEmpty
                            ? _buildEmptyState(context)
                            : ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                padding: EdgeInsets.zero,
                                itemCount: filteredDocs.length,
                                separatorBuilder: (_, __) => Divider(
                                  height: 12,
                                  thickness: 0.8,
                                  color: theme.colorScheme.outlineVariant.withOpacity(0.4),
                                ),
                                itemBuilder: (context, index) {
                                  final doc = filteredDocs[index];
                                  return Dismissible(
                                    key: Key('liked_${doc.id}'),
                                    direction: DismissDirection.endToStart,
                                    background: Container(
                                      alignment: Alignment.centerRight,
                                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD32F2F),
                                        borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                                      ),
                                      child: const Icon(
                                        Icons.delete_outline_rounded,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                                    ),
                                    onDismissed: (direction) {
                                      state.deleteDocument(doc.id);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('"${doc.title.replaceAll('/', '')}" deleted'),
                                          action: SnackBarAction(
                                            label: 'Undo',
                                            onPressed: () {
                                              state.restoreDocument(doc);
                                            },
                                          ),
                                        ),
                                      );
                                    },
                                    child: StitchCard(
                                      title: doc.title,
                                      dateAndSize: '${doc.addedDate} • ${doc.size}',
                                      fileType: doc.fileType,
                                      isFavorite: doc.isFavorite,
                                      filePath: doc.filePath,
                                      onTap: () {
                                        state.selectDocument(doc);
                                        if (doc.fileType.toLowerCase() == 'pdf') {
                                          state.setScreen(AppScreen.pdfViewer);
                                        } else {
                                          state.setScreen(AppScreen.fileDetails);
                                        }
                                      },
                                      onFavoriteToggle: (fav) =>
                                          state.toggleFavorite(doc.id),
                                      onMoreTap: () => showDocumentOptionsBottomSheet(
                                          context, doc, state),
                                    ),
                                  );
                                },
                              ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }


  // ── Filter chips ───────────────────────────────────────────────────────────
  Widget _buildFilterChips(BuildContext context, bool isDark) {
    final theme = Theme.of(context);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: _filters.map((filter) {
          final isSelected = _activeFilter == filter;

          IconData? chipIcon;
          if (filter == 'PDF') chipIcon = Icons.picture_as_pdf_outlined;
          if (filter == 'Folders') chipIcon = Icons.folder_outlined;
          if (filter == 'Favorites') chipIcon = Icons.star_outline;

          return Padding(
            padding: const EdgeInsets.only(right: AppTokens.base),
            child: GestureDetector(
              onTap: () => setState(() => _activeFilter = filter),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? theme.colorScheme.error
                      : (isDark
                          ? const Color(0xFF282828)
                          : const Color(0xFFF0F0F0)),
                  borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                  border: Border.all(
                    color: isSelected
                        ? theme.colorScheme.error
                        : Colors.transparent,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (chipIcon != null) ...[
                      Icon(
                        chipIcon,
                        size: 14,
                        color: isSelected
                            ? theme.colorScheme.onError
                            : theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 5),
                    ],
                    Text(
                      filter,
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: isSelected
                            ? theme.colorScheme.onError
                            : theme.colorScheme.onSurfaceVariant,
                        fontWeight:
                            isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Section header row ─────────────────────────────────────────────────────
  Widget _buildSectionRow(
    BuildContext context,
    String title, {
    required VoidCallback onSeeAll,
    String seeAllLabel = 'See All',
  }) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onSurface,
          ),
        ),
        GestureDetector(
          onTap: onSeeAll,
          child: Row(
            children: [
              Text(
                seeAllLabel,
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
    );
  }

  // ── Folder tile (horizontal scroll) ───────────────────────────────────────
  Widget _buildFolderTile(
      BuildContext context, Document folder, AppState state, bool isDark) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: () {
        state.openFolder(folder.id);
        state.setBottomNavIndex(0); // go to home to browse folder
      },
      child: SizedBox(
        width: 86,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Folder icon with three-dot menu overlay
            Stack(
              children: [
                Container(
                  width: 74,
                  height: 68,
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF282828)
                        : const Color(0xFFFFF0F0),
                    borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                    border: null,
                  ),
                  child: Icon(
                    Icons.folder_rounded,
                    color: theme.colorScheme.error.withOpacity(0.65),
                    size: 38,
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 4,
                  child: GestureDetector(
                    onTap: () => showDocumentOptionsBottomSheet(
                        context, folder, state),
                    child: Icon(
                      Icons.more_vert,
                      size: 16,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              folder.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 11,
                color: theme.colorScheme.onSurface,
              ),
            ),
            Text(
              '${state.getAllFolderItemsCount(folder.id)} items',
              maxLines: 1,
              style: theme.textTheme.bodySmall?.copyWith(
                fontSize: 10,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Empty chip (inline) ────────────────────────────────────────────────────
  Widget _buildEmptyChip(BuildContext context, String label) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
        ),
      ),
    );
  }

  // ── Full empty state ───────────────────────────────────────────────────────
  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60.0),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.folder_open_outlined,
              size: 60,
              color: theme.colorScheme.error.withOpacity(0.35),
            ),
            const SizedBox(height: AppTokens.stackMd),
            Text(
              'No files found',
              style: theme.textTheme.headlineSmall?.copyWith(
                color: theme.colorScheme.onSurface,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppTokens.stackSm),
            Text(
              'Upload or scan documents to see them here.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.outline,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
