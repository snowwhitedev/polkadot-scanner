import React, { useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import LinearProgressWithLabel from '../components/LinearProgressWithLabel';
import EventDataTable from '../components/EventDataTable';
import { EventGridRowItem } from '../utils/interfaces';
import { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: 200,
      },
    },
    'scan-form': {
      marginTop: '50px',
      marginBottom: '30px',
      display: 'flex',
      gap: '15px'
    },
    'spinner-container': {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '30px'
    }
  }),
);

const MAX_BLOCKS_NUMBER = 25;

export default function Scanner() {
  const classes = useStyles();
  const [startBlock, setStartBlock] = useState<string>('');
  const [endBlock, setEndBlock] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('wss://rpc.polkadot.io');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [events, setEvents] = useState<Array<EventGridRowItem>>([]);
  const [firstBlockFetched, setFirstBlockFetched] = useState<boolean>(true);  
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    const getLastBlock = async () => {
      const wsProvider = new WsProvider(endPoint);
      const api = await ApiPromise.create({ provider: wsProvider });

      const lastBlock = await api.rpc.chain.getBlock();
      setEndBlock(lastBlock.block.header.number.toString());
    }
    getLastBlock()
  }, [])

  useEffect(() => {
    /**
     * @dev it's okay - using if-else here
     */
    if (startBlock === '' || endBlock === '' || 
        isNaN(Number(startBlock)) === true ||
        isNaN(Number(endBlock)) === true ||
        Number(startBlock) > Number(endBlock) ||
        Number(endBlock) - Number(startBlock) > MAX_BLOCKS_NUMBER ||
        endPoint === ''
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [startBlock, endBlock, endPoint])
  
  const handleChnageStartBlock = (e: any) => {
    setStartBlock(e.target.value);
  }

  const handleChangeEndBlock = (e: any) => {
    setEndBlock(e.target.value);
  }

  const handleChangeEndPoint = (e: any) => {
    setEndPoint(e.target.value);
  }

  const handleScanner = async () => {
    setFirstBlockFetched(false);
    setScanProgress(0);
    const wsProvider = new WsProvider(endPoint);
    const api = await ApiPromise.create({ provider: wsProvider });
    const adjustedEvents: Array<EventGridRowItem> = [];
    for (let ii = Number(startBlock); ii <= Number(endBlock); ii++) {
      const blockHash = await api.rpc.chain.getBlockHash(ii);
      const rawEvents = await api.query.system.events.at(blockHash);

      rawEvents.forEach((event, index) => {
        const adjustedEvent: EventGridRowItem = {
          id: Number(`${ii}${index}`),
          name: event.event.method,
          section: event.event.section,
          weight: event.event.size
        }
        adjustedEvents.push(adjustedEvent)
      });
      
      setEvents([
        ...adjustedEvents
      ]);
      if (ii === Number(startBlock)) {
        setFirstBlockFetched(true);
      }
      const progressStatus = ~~((ii - Number(startBlock) + 1) / (Number(endBlock) - Number(startBlock) + 1) * 100);
      setScanProgress(progressStatus);
    }
  }


  return(
    <>
      <ValidatorForm onSubmit={handleScanner} className={classes['scan-form']}>
        <TextValidator
          label="Start Block"
          name="startBlock"
          value={startBlock}
          variant="outlined"
          validators={['required']}
          errorMessages={['This field is requried']}
          onChange={handleChnageStartBlock}
        />
        <TextValidator
          label="End Block"
          name="endBlock"
          value={endBlock}
          variant="outlined"
          validators={['required']}
          errorMessages={['This field is requried']}
          onChange={handleChangeEndBlock}
        />
        <TextValidator
          label="Endpoint"
          name="endPoint"
          value={endPoint}
          variant="outlined"
          validators={['required']}
          errorMessages={['This field is requried']}
          onChange={handleChangeEndPoint}
        />
        <Button type="submit" variant="contained" color="primary" disabled={disabled}>Scan</Button>
        {
          (Number(endBlock) - Number(startBlock) > MAX_BLOCKS_NUMBER) &&
            <Alert severity="error">You can scan only maximum {MAX_BLOCKS_NUMBER} block one time.</Alert>
        }
      </ValidatorForm>
      <LinearProgressWithLabel value={scanProgress} />
      {
        firstBlockFetched === true
          ? <EventDataTable rows={events} />
          : <div className={classes['spinner-container']}>
              <CircularProgress color="secondary" size={80} />
            </div>
      }
    </>
  )
}
