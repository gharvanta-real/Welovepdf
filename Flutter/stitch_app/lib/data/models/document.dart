class Document {
  final String id;
  final String title;
  final String fileType; // pdf, docx, xlsx, pptx, folder
  final String size;
  final String addedDate;
  final bool isFavorite;
  final int pagesCount;
  final String author;
  final String description;
  final String? filePath;
  final String? parentFolderId;

  Document({
    required this.id,
    required this.title,
    required this.fileType,
    required this.size,
    required this.addedDate,
    this.isFavorite = false,
    this.pagesCount = 1,
    this.author = 'Unknown',
    this.description = '',
    this.filePath,
    this.parentFolderId,
  });

  Document copyWith({
    String? id,
    String? title,
    String? fileType,
    String? size,
    String? addedDate,
    bool? isFavorite,
    int? pagesCount,
    String? author,
    String? description,
    String? filePath,
    String? parentFolderId,
    bool clearParentFolder = false,
  }) {
    return Document(
      id: id ?? this.id,
      title: title ?? this.title,
      fileType: fileType ?? this.fileType,
      size: size ?? this.size,
      addedDate: addedDate ?? this.addedDate,
      isFavorite: isFavorite ?? this.isFavorite,
      pagesCount: pagesCount ?? this.pagesCount,
      author: author ?? this.author,
      description: description ?? this.description,
      filePath: filePath ?? this.filePath,
      parentFolderId: clearParentFolder ? null : (parentFolderId ?? this.parentFolderId),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'fileType': fileType,
      'size': size,
      'addedDate': addedDate,
      'isFavorite': isFavorite,
      'pagesCount': pagesCount,
      'author': author,
      'description': description,
      'filePath': filePath,
      'parentFolderId': parentFolderId,
    };
  }

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['id'] as String,
      title: json['title'] as String,
      fileType: json['fileType'] as String,
      size: json['size'] as String,
      addedDate: json['addedDate'] as String,
      isFavorite: json['isFavorite'] as bool? ?? false,
      pagesCount: json['pagesCount'] as int? ?? 1,
      author: json['author'] as String? ?? 'Unknown',
      description: json['description'] as String? ?? '',
      filePath: json['filePath'] as String?,
      parentFolderId: json['parentFolderId'] as String?,
    );
  }
}
