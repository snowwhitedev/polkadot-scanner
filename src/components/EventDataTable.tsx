import React from 'react';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { EventGridRowItem } from '../utils/interfaces';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Block Number', width: 300 },
  {
    field: 'name',
    headerName: 'Event',
    width: 280,
    editable: true,
  },
  {
    field: 'section',
    headerName: 'Section',
    width: 240,
    editable: true,
  },
  {
    field: 'weight',
    headerName: 'Size',
    width: 300,
    editable: true,
  }
];

export default function EventDataTable({ rows }: { rows: Array<EventGridRowItem> }) {

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 15]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
}
