import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../components/stitch_card.dart';
import '../../components/stitch_input.dart';
import '../../state/app_state.dart';
import '../../../data/models/document.dart';
import 'sheets/dashboard_sheets.dart';

class RecentTab extends StatefulWidget {
  const RecentTab({super.key});

  @override
  State<RecentTab> createState() => _RecentTabState();
}

class _RecentTabState extends State<RecentTab> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _getGroupLabel(String addedDate) {
    if (addedDate.contains('mins') ||
        addedDate.contains('hour') ||
        addedDate.contains('now') ||
        addedDate.contains('Just')) {
      return 'Today';
    } else if (addedDate.contains('02/03/2024') ||
        addedDate.contains('01/03/2024')) {
      return 'Yesterday';
    } else {
      return 'Earlier this month';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);

    final docs = state.recentDocuments;

    // Grouping logic
    final Map<String, List<Document>> groupedDocs = {};
    for (var doc in docs) {
      final label = _getGroupLabel(doc.addedDate);
      if (!groupedDocs.containsKey(label)) {
        groupedDocs[label] = [];
      }
      groupedDocs[label]!.add(doc);
    }

    // Maintain a consistent sorted group order
    final sortedLabels = ['Today', 'Yesterday', 'Earlier this month']
        .where((label) => groupedDocs.containsKey(label))
        .toList();

    final isDark = theme.brightness == Brightness.dark;

    return Column(
      children: [
        // Rounded card sheet starts right at the top of this tab
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
              vertical: 20,
            ),
            child: Column(
              children: [
                StitchSearchBar(
                  controller: _searchController,
                  hintText: 'Search recent files...',
                  onChanged: (val) {
                    state.updateRecentSearch(val);
                  },
                  onFilterTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Recent filter applied.')),
                    );
                  },
                ),
                const SizedBox(height: AppTokens.stackLg),
                Expanded(
                  child: docs.isEmpty
                      ? _buildEmptyState(context, 'No recent files found')
                      : ListView.builder(
                          padding: const EdgeInsets.only(bottom: 100),
                          itemCount: sortedLabels.length,
                          itemBuilder: (context, groupIndex) {
                            final label = sortedLabels[groupIndex];
                            final groupItems = groupedDocs[label]!;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: AppTokens.stackMd),
                                  child: Text(
                                    label,
                                    style:
                                        theme.textTheme.labelLarge?.copyWith(
                                      color: theme.colorScheme.error,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                ListView.separated(
                                  shrinkWrap: true,
                                  physics:
                                      const NeverScrollableScrollPhysics(),
                                  padding: EdgeInsets.zero,
                                  itemCount: groupItems.length,
                                  separatorBuilder: (c, i) => Divider(
                                    height: 12,
                                    thickness: 0.8,
                                    color: theme.colorScheme.outlineVariant.withOpacity(0.4),
                                  ),
                                  itemBuilder: (c, index) {
                                    final doc = groupItems[index];
                                    return Dismissible(
                                      key: Key('recent_${doc.id}'),
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
                                        dateAndSize:
                                            '${doc.addedDate} • ${doc.size}',
                                        fileType: doc.fileType,
                                        isFavorite: doc.isFavorite,
                                        filePath: doc.filePath,
                                        isProcessing: doc.isProcessing,
                                        onTap: () {
                                          if (doc.isProcessing) return;
                                          state.selectDocument(doc);
                                          if (doc.fileType.toLowerCase() ==
                                              'pdf') {
                                            state.setScreen(
                                                AppScreen.pdfViewer);
                                          } else {
                                            state.setScreen(
                                                AppScreen.fileDetails);
                                          }
                                        },
                                        onFavoriteToggle: doc.isProcessing
                                            ? null
                                            : (fav) {
                                                state.toggleFavorite(doc.id);
                                              },
                                        onMoreTap: doc.isProcessing
                                            ? () {}
                                            : () {
                                                showDocumentOptionsBottomSheet(
                                                    context, doc, state);
                                              },
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(height: AppTokens.gutter),
                              ],
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context, String message) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history_toggle_off,
            size: 56,
            color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
          ),
          const SizedBox(height: AppTokens.stackMd),
          Text(
            message,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
