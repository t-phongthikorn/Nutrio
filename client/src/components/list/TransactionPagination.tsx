

interface TransactionPaginationProp {
    currentPage: number;
    totalPages: number;
    pagePattern: (number | "...")[];
    onChangePage: (page: number) => void;
}

export const TransactionPagination = ({currentPage, totalPages, pagePattern, onChangePage} : TransactionPaginationProp) => {
    return <>
        <div className="flex justify-center items-center gap-2 mt-3 bg-white p-4 rounded-4xl shadow-2xl mb-5">
          {/* Prev */}
          <button
            onClick={() => {
                onChangePage(Math.max(currentPage - 1, 1))
            }}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-xl btn bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          {/* Pages — fixed width container */}
          <div className="flex items-center gap-2 w-64 justify-center">
            {pagePattern.map((p : any, index : any) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 text-center text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => {
                    onChangePage(p)
                  }}
                  className={`w-8 h-8 rounded-4xl flex-shrink-0 ${
                    currentPage === p
                      ? "btn btn-accent text-white"
                      : "btn btn-accen bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          {/* Next */}
          <button
            onClick={() => {
              onChangePage(Math.min(currentPage + 1, totalPages))
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-1 btn rounded-xl bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
    </>
}