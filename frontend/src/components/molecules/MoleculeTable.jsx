import React from 'react';
import { DataTable } from '../ui/DataTable';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'approved': return 'bg-green-100 text-green-700 border-green-200 border';
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200 border';
        case 'in evaluation': return 'bg-blue-100 text-blue-700 border-blue-200 border';
        default: return 'bg-slate-100 text-slate-700 border-slate-200 border';
    }
};

export function MoleculeTable({ data, isLoading, pagination, onPageChange }) {
    const columns = [
        {
            header: '',
            accessor: 'structure_2d',
            className: 'w-12',
            cell: (item) => (
                item.structure_2d ?
                    <img src={item.structure_2d} alt="" className="w-8 h-8 object-contain" /> :
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-300 text-[10px]">2D</div>
            )
        },
        { header: 'Name', accessor: 'name', className: 'font-medium text-slate-900' },
        { header: 'CAS Number', accessor: 'cas_number', className: 'font-mono text-xs' },
        {
            header: 'Status',
            accessor: (item) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status || 'New'}
                </span>
            )
        },
        { header: 'Created By', accessor: 'created_by' },
        {
            header: 'Actions',
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`/molecules/${item._id}`}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </Link>
                </div>
            )
        }
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            total={pagination.total}
            page={pagination.page}
            pageSize={pagination.size}
            onPageChange={onPageChange}
        />
    );
}
