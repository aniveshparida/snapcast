"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { generatePagination, updateURLParams } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  queryString?: string;
  filterString?: string;
};

const Pagination = ({
  currentPage,
  totalPages,
  queryString,
  filterString,
}: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pages = generatePagination(currentPage, totalPages);

  const goToPage = (page: number) => {
    const url = updateURLParams(searchParams, {
      page: String(page),
      ...(queryString ? { query: queryString } : {}),
      ...(filterString ? { filter: filterString } : {}),
    }, pathname);
    router.push(url);
  };

  return (
    <footer className="pagination">
      <button
        className="page-control"
        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <Image src="/assets/icons/arrow-left.svg" alt="Prev" width={16} height={16} />
      </button>

      <ul>
        {pages.map((p, idx) => (
          <li key={`${p}-${idx}`}>
            {p === "..." ? (
              <span className="dots">...</span>
            ) : (
              <button
                className={`page-number ${p === currentPage ? "active" : ""}`}
                onClick={() => goToPage(Number(p))}
              >
                {p}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        className="page-control"
        onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <Image src="/assets/icons/arrow-right.svg" alt="Next" width={16} height={16} />
      </button>
    </footer>
  );
};

export default Pagination;
