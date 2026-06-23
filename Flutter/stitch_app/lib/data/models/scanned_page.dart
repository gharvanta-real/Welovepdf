import 'dart:typed_data';
import 'package:flutter/material.dart';

class ScannedPage {
  final Uint8List imageBytes;
  final String filter; // 'Original', 'B&W', 'Grayscale', 'Magic Color', 'Auto-Enhance'
  final int rotationQuarters; // 0, 1, 2, 3
  
  // Crop handles relative to 260x360 container
  final Offset topLeft;
  final Offset topRight;
  final Offset bottomLeft;
  final Offset bottomRight;

  ScannedPage({
    required this.imageBytes,
    this.filter = 'Original',
    this.rotationQuarters = 0,
    this.topLeft = const Offset(20, 20),
    this.topRight = const Offset(240, 20),
    this.bottomLeft = const Offset(20, 340),
    this.bottomRight = const Offset(240, 340),
  });

  ScannedPage copyWith({
    Uint8List? imageBytes,
    String? filter,
    int? rotationQuarters,
    Offset? topLeft,
    Offset? topRight,
    Offset? bottomLeft,
    Offset? bottomRight,
  }) {
    return ScannedPage(
      imageBytes: imageBytes ?? this.imageBytes,
      filter: filter ?? this.filter,
      rotationQuarters: rotationQuarters ?? this.rotationQuarters,
      topLeft: topLeft ?? this.topLeft,
      topRight: topRight ?? this.topRight,
      bottomLeft: bottomLeft ?? this.bottomLeft,
      bottomRight: bottomRight ?? this.bottomRight,
    );
  }
}
