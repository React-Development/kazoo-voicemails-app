import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";
import { useDispatch, useSelector } from "react-redux";
import {
  getVmMessagesAction,
  updateVmMessageAction,
} from "../../redux/actions/vmMessages/vmMessages";
import {
  TableHead,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  Backdrop,
} from "@material-ui/core";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import humanizeDuration from "humanize-duration";

const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

const TablePaginationActions = (props) => {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
};

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const useStyles2 = makeStyles((theme) => ({
  table: {
    minWidth: 500,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "blue",
  },
}));

//  Folder types for Select

const folderTypes = [
  { value: "new", label: "New" },
  { value: "saved", label: "Saved" },
  { value: "deleted", label: "Deleted" },
];

const folderStates = () =>
  folderTypes.map((el) => (
    <MenuItem key={`id-${el.value}`} value={el.value}>
      {el.label}
    </MenuItem>
  ));

// Table Component
const VMMessages = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getVmMessages = () => dispatch(getVmMessagesAction());
    getVmMessages();
  }, [dispatch]);

  const classes = useStyles2();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const vmMessages = useSelector((state) => state.vmMessages.messages);
  const isLoading = useSelector((state) => state.vmMessages.isLoading);
  const isProcessing = useSelector((state) => state.vmMessages.isProcessing);
  const isFetching = useSelector((state) => state.vmMessages.isFetching);
  const { boxID } = props;
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, vmMessages.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // For update process
  const [folder, setFolder] = useState("");

  const handleChange = (e) => {
    setFolder(e.target.value);
  };

  const onChange = (messageID, messageFolder) => {
    dispatch(
      updateVmMessageAction(boxID, messageID, { folder: messageFolder })
    );
  };

  // To fix out of range issue on Table
  useEffect(() => {
    if (vmMessages.length <= rowsPerPage && page > 0) {
      setPage(0);
    }
  }, [vmMessages.length, rowsPerPage, page]);

  return (
    <div>
      {isProcessing && (
        <Backdrop id="myBackdrop" className={classes.backdrop} open={true}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <TableContainer component={Paper} style={{ padding: "2rem" }}>
        <Table className={classes.table} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell align="right">To</TableCell>
              <TableCell align="right">Duration</TableCell>
              <TableCell padding="checkbox" align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  rowSpan={vmMessages.length}
                  className="text-center"
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              <React.Fragment>
                {Object.keys(vmMessages).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} rowSpan={5} className="text-center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
                {(rowsPerPage > 0
                  ? vmMessages.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : vmMessages
                ).map((message) => {
                  const to = message.to.includes("+")
                    ? parsePhoneNumberFromString(
                        message.to.split("@")[0]
                      ).formatInternational()
                    : message.to;
                  const from = message.from.includes("anonymous")
                    ? "Anonymous"
                    : message["caller_id_name"].includes("+")
                    ? parsePhoneNumberFromString(
                        message["caller_id_name"].split("@")[0]
                      ).formatInternational()
                    : message["caller_id_name"];
                  const duration = humanizeDuration(message.length, {
                    units: ["h", "m", "s"],
                    round: true,
                  });

                  return (
                    <TableRow key={message["media_id"]}>
                      <TableCell component="th" scope="row">
                        {from}
                      </TableCell>
                      <TableCell align="right">{to}</TableCell>
                      <TableCell align="right">{duration}</TableCell>
                      <TableCell align="right">
                        <FormControl className={classes.formControl}>
                          <Select
                            variant="outlined"
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={message.folder}
                            className="text-center"
                            onChange={(e) => {
                              handleChange(e);
                              onChange(message["media_id"], e.target.value);
                            }}
                          >
                            {folderStates()}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 30 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={3}
                count={vmMessages.length}
                rowsPerPage={rowsPerPage}
                page={page > 0 && vmMessages.length === rowsPerPage ? 0 : page}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
  );
};
export default VMMessages;
