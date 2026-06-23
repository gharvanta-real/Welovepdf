import 'package:flutter/material.dart';
import '../../../../core/theme/app_tokens.dart';

Widget buildSheetHeader(BuildContext context, String title) {
  final theme = Theme.of(context);
  return Column(
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
        title,
        style: theme.textTheme.headlineMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.onSurface,
        ),
      ),
      const SizedBox(height: AppTokens.stackLg),
    ],
  );
}
