import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_tokens.dart';
import '../components/stitch_card.dart';
import '../state/app_state.dart';
import 'dashboard/sheets/dashboard_sheets.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final state = Provider.of<AppState>(context, listen: false);
    _searchController.text = state.searchQuery;
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    Provider.of<AppState>(context, listen: false)
        .updateSearchQuery(_searchController.text);
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final results = state.searchResults;

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
        backgroundColor: theme.colorScheme.error,
        appBar: AppBar(
          backgroundColor: theme.colorScheme.error,
          leading: IconButton(
            onPressed: () {
              state.updateSearchQuery('');
              state.goBack();
            },
            icon: Icon(Icons.arrow_back, color: appBarFgColor),
          ),
          title: Text(
            'Search Documents',
            style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: appBarFgColor),
          ),
          actions: [
            if (_searchController.text.isNotEmpty)
              IconButton(
                onPressed: () {
                  _searchController.clear();
                },
                icon: Icon(Icons.clear, color: appBarFgColor),
              ),
          ],
        ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF121212) : Colors.white,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(12),
          ),
        ),
        child: Column(
        children: [
          // Styled Search Input Box (Inset)
          Padding(
            padding: const EdgeInsets.all(AppTokens.gutter),
            child: Container(
              height: 56,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                  width: 1.0,
                ),
                boxShadow: const [AppTokens.shadowLevel2],
              ),
              child: TextField(
                controller: _searchController,
                autofocus: true,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface,
                ),
                onSubmitted: (val) {
                  state.addToSearchHistory(val);
                },
                decoration: InputDecoration(
                  hintText: 'Search file name or extension...',
                  hintStyle: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
                  ),
                  prefixIcon: Padding(
                    padding: const EdgeInsets.only(left: 16.0, right: 8.0),
                    child: Icon(
                      Icons.search,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16.0),
                ),
              ),
            ),
          ),

          // Search suggestion categories (if query is empty)
          if (_searchController.text.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTokens.containerPadding,
                vertical: AppTokens.stackMd,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Recent Searches',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onSurface,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (state.searchHistory.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        state.clearSearchHistory();
                      },
                      child: Text(
                        'Clear',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: theme.colorScheme.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: state.searchHistory.isEmpty
                  ? Center(
                      child: Text(
                        'No recent searches',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.outline,
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: AppTokens.containerPadding),
                      itemCount: state.searchHistory.length,
                      itemBuilder: (context, index) {
                        final query = state.searchHistory[index];
                        return _buildSuggestionTile(context, query, query);
                      },
                    ),
            ),
          ] else ...[
            // Search Results list
            Expanded(
              child: results.isEmpty
                  ? _buildNoResults(context)
                  : ListView.separated(
                      padding: EdgeInsets.zero,
                      itemCount: results.length,
                      separatorBuilder: (c, i) => const SizedBox(height: AppTokens.stackMd),
                      itemBuilder: (c, index) {
                        final doc = results[index];
                        return StitchCard(
                          title: doc.title,
                          dateAndSize: '${doc.addedDate} • ${doc.size}',
                          fileType: doc.fileType,
                          isFavorite: doc.isFavorite,
                          filePath: doc.filePath,
                          onTap: () {
                            if (_searchController.text.isNotEmpty) {
                              state.addToSearchHistory(_searchController.text);
                            }
                            state.selectDocument(doc);
                            if (doc.fileType.toLowerCase() == 'pdf') {
                              state.setScreen(AppScreen.pdfViewer);
                            } else {
                              state.setScreen(AppScreen.fileDetails);
                            }
                          },
                          onFavoriteToggle: (fav) {
                            state.toggleFavorite(doc.id);
                          },
                          onMoreTap: () {
                            showDocumentOptionsBottomSheet(context, doc, state);
                          },
                        );
                      },
                    ),
            ),
          ],
        ],
      ),
      ),
    ),);
  }

  Widget _buildSuggestionTile(BuildContext context, String title, String query) {
    final theme = Theme.of(context);
    return ListTile(
      leading: Icon(Icons.history, color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6)),
      title: Text(
        title,
        style: theme.textTheme.bodyLarge?.copyWith(
          color: theme.colorScheme.onSurface,
        ),
      ),
      trailing: const Icon(Icons.arrow_outward, size: 18),
      onTap: () {
        setState(() {
          _searchController.text = query;
        });
      },
    );
  }

  Widget _buildNoResults(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.find_in_page_outlined,
            size: 64,
            color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
          ),
          const SizedBox(height: AppTokens.stackMd),
          Text(
            'No matching documents found',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppTokens.stackSm),
          Text(
            'Check spelling or try a different search term',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.outline,
            ),
          ),
        ],
      ),
    );
  }
}
