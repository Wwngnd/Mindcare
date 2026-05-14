export function getBookCover(isbn) {
    if (!isbn) {
        return "https://via.placeholder.com/300x450?text=No+Cover";
    }

    const cleanISBN = String(isbn).replace(/[^0-9X]/gi, "");

    return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
}