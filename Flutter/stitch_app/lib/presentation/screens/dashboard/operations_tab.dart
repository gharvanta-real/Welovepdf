import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_tokens.dart';
import '../../state/app_state.dart';

class OperationsTab extends StatelessWidget {
  const OperationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final jobs = state.activeJobs;

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
            padding: const EdgeInsets.symmetric(
              horizontal: AppTokens.containerPadding,
              vertical: 20,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Active Operations',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    if (jobs.any((j) => j.status != 'processing'))
                      TextButton.icon(
                        onPressed: () => state.clearActiveJobs(),
                        icon: const Icon(Icons.clear_all, size: 18),
                        label: const Text('Clear Finished'),
                        style: TextButton.styleFrom(
                          foregroundColor: theme.colorScheme.error,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: AppTokens.stackLg),
                Expanded(
                  child: jobs.isEmpty
                      ? _buildEmptyState(context)
                      : ListView.separated(
                          padding: const EdgeInsets.only(bottom: 80),
                          itemCount: jobs.length,
                          separatorBuilder: (c, i) => const Divider(height: 20),
                          itemBuilder: (context, index) {
                            final job = jobs[index];
                            return _buildJobCard(context, job);
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

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.task_outlined,
            size: 64,
            color: theme.colorScheme.onSurfaceVariant.withOpacity(0.3),
          ),
          const SizedBox(height: AppTokens.stackLg),
          Text(
            'No active operations',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: AppTokens.stackSm),
          Text(
            'In-progress and finished tasks will appear here.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobCard(BuildContext context, ActiveJob job) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    IconData statusIcon;
    Color iconColor;
    Widget trailingWidget;

    switch (job.status) {
      case 'processing':
        statusIcon = Icons.hourglass_empty;
        iconColor = Colors.orange;
        trailingWidget = SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: theme.colorScheme.error,
          ),
        );
        break;
      case 'completed':
        statusIcon = Icons.check_circle_outline;
        iconColor = Colors.green;
        trailingWidget = Icon(Icons.check_circle, color: Colors.green[600]);
        break;
      case 'failed':
      default:
        statusIcon = Icons.error_outline;
        iconColor = theme.colorScheme.error;
        trailingWidget = Icon(Icons.error, color: theme.colorScheme.error);
        break;
    }

    final formattedTime = '${job.timestamp.hour.toString().padLeft(2, '0')}:${job.timestamp.minute.toString().padLeft(2, '0')}:${job.timestamp.second.toString().padLeft(2, '0')}';
    final toolDisplay = job.toolId.replaceAll('-', ' ').replaceAll('_', ' ').toUpperCase();

    return Container(
      padding: const EdgeInsets.all(AppTokens.base * 1.5),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.grey[50],
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(
          color: isDark ? const Color(0xFF2C2C2C) : Colors.grey[200]!,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: iconColor.withOpacity(0.1),
            child: Icon(statusIcon, color: iconColor),
          ),
          const SizedBox(width: AppTokens.gutter),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  toolDisplay,
                  style: theme.textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.stackSm),
                Text(
                  job.details,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: AppTokens.stackSm),
                Text(
                  'Started at $formattedTime',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.outline,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppTokens.stackSm),
          trailingWidget,
        ],
      ),
    );
  }
}
