import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="py-4 flex justify-center w-full">
      <Pagination>
        <PaginationContent className="bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => { e.preventDefault(); if(currentPage > 1) onPageChange(currentPage - 1); }}
              className={`cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
            />
          </PaginationItem>
          
          {pages.map((p, idx) => (
            <PaginationItem key={idx}>
              {p === '...' ? (
                <PaginationEllipsis className="text-slate-500" />
              ) : (
                <PaginationLink 
                  onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
                  isActive={currentPage === p}
                  className={`cursor-pointer ${currentPage === p ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) onPageChange(currentPage + 1); }}
              className={`cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
