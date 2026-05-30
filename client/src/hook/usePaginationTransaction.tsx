import { useMemo, useState } from "react";
import { QueryTransaction } from "../types/transaction";
import getOwnPagination from "../utils/pagination";

export const usePaginationTransaction = (transaction: QueryTransaction[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalPages = useMemo(() => {
    return Math.ceil(transaction.length / itemsPerPage);
  }, [transaction, itemsPerPage]);

  const pages = useMemo(() => {
    return getOwnPagination(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return transaction.slice(startIndex, startIndex + itemsPerPage);
  }, [transaction, currentPage, itemsPerPage]);

  return {
    totalPages,
    pages,
    currentPage,
    itemsPerPage,
    paginatedTransactions,
    setCurrentPage,
    setItemsPerPage
  }
};
