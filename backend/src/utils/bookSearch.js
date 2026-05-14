export async function searchBookMetadata(title, author = "") {
    try {
        // Query lebih spesifik: pisahkan title dan author
        const query = encodeURIComponent(
            `intitle:${title}${author ? `+inauthor:${author}` : ""}`
        );

        const res = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&langRestrict=id`
        );

        const data = await res.json();
        const item = data.items?.[0];

        if (!item) {
            // Fallback: cari hanya pakai judul tanpa filter author
            const fallbackQuery = encodeURIComponent(`intitle:${title}`);
            const fallbackRes = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${fallbackQuery}&maxResults=1`
            );
            const fallbackData = await fallbackRes.json();
            const fallbackItem = fallbackData.items?.[0];
            if (!fallbackItem) return null;

            const fallbackInfo = fallbackItem.volumeInfo;
            const fallbackIsbn = fallbackInfo.industryIdentifiers?.find(
                (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
            );

            return {
                isbn: fallbackIsbn?.identifier ?? null,
                thumbnail: fallbackInfo.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
                description: fallbackInfo.description ?? null
            };
        }

        const info = item.volumeInfo;
        const isbnObj = info.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
        );

        return {
            isbn: isbnObj?.identifier ?? null,
            thumbnail: info.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
            description: info.description ?? null
        };

    } catch (error) {
        return null;
    }
}