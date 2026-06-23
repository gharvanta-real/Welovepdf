import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../state/app_state.dart';

void showSignSheet(BuildContext context) {
  final state = Provider.of<AppState>(context, listen: false);
  Navigator.pop(context);
  state.setScreen(AppScreen.editDocument);
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('Select edit document toolbar option to draw signature!')),
  );
}
