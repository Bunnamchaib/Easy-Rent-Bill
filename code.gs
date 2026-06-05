var SHEET_SCHEMAS = {
  Settings: ["key", "value", "note", "updated_at"],
  Rooms: ["room_id", "room_no", "floor", "status", "tenant_name", "phone", "base_rent", "common_fee", "parking_fee", "internet_fee", "other_fee", "note", "created_at", "updated_at"],
  Tenants: ["tenant_id", "room_id", "name", "phone", "start_date", "end_date", "status", "created_at", "updated_at"],
  Meter_Readings: ["meter_id", "billing_month", "room_id", "room_no", "water_prev", "water_current", "water_unit", "water_rate", "water_amount", "electric_prev", "electric_current", "electric_unit", "electric_rate", "electric_amount", "recorded_at", "updated_at", "note"],
  Invoices: ["invoice_id", "invoice_no", "billing_month", "room_id", "room_no", "tenant_id", "tenant_name", "rent_amount", "common_fee", "parking_fee", "internet_fee", "other_fee", "water_amount", "electric_amount", "custom_amount", "total_amount", "paid_amount", "status", "created_at", "paid_at", "updated_at", "note"],
  Payments: ["payment_id", "invoice_id", "invoice_no", "room_id", "room_no", "tenant_name", "paid_amount", "method", "slip_name", "slip_base64", "paid_at", "received_by", "note", "created_at"],
  Custom_Charges: ["charge_id", "room_id", "room_no", "billing_month", "name", "amount", "type", "active", "created_at", "updated_at"],
  Logs: ["log_id", "action", "ref_type", "ref_id", "detail", "created_at", "user"]
};

var PUBLIC_ACTIONS = {
  PING: true,
  LOGIN: true,
  INIT_DATABASE: true
};

var APP_VERSION = "2026-06-05 11:10";

function doGet() {
  return jsonResponse({
    success: true,
    data: {
      message: "Easy Rent Bill API is running",
      spreadsheet_name: getSpreadsheet_().getName()
    },
    message: "OK"
  });
}

function doPost(e) {
  try {
    var request = parseRequest_(e);
    var action = String(request.action || "");
    var payload = request.payload || {};

    if (!PUBLIC_ACTIONS[action]) {
      authorize_(request.auth || {});
    }

    var result = routeAction_(action, payload);
    return jsonResponse({
      success: true,
      data: result,
      message: "OK"
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error && error.message ? error.message : String(error),
      message: "Something went wrong"
    });
  }
}

function routeAction_(action, payload) {
  switch (action) {
    case "PING": return { status: "OK", spreadsheet: getSpreadsheet_().getName(), version: APP_VERSION, timezone: getAppTimeZone_() };
    case "LOGIN": return login_(payload);
    case "INIT_DATABASE": return initDatabase();
    case "GET_SETTINGS": return getSettings();
    case "SAVE_SETTINGS": return saveSettings(payload);
    case "GET_DASHBOARD_SUMMARY": return getDashboardSummary(payload);
    case "GET_LOGS": return getLogs(payload);
    case "GET_ROOMS": return getRooms(payload);
    case "GET_ROOM_DETAIL": return getRoomDetail(payload);
    case "CREATE_ROOM": return createRoom(payload);
    case "UPDATE_ROOM": return updateRoom(payload);
    case "DELETE_ROOM": return deleteRoom(payload);
    case "GET_PREVIOUS_METER": return getPreviousMeter(payload);
    case "SAVE_METER_READING": return saveMeterReading(payload);
    case "GET_METER_PROGRESS": return getMeterProgress(payload);
    case "GET_METER_READINGS": return getMeterReadings(payload);
    case "GENERATE_INVOICES": return generateInvoices(payload);
    case "GET_INVOICES": return getInvoices(payload);
    case "GET_INVOICE_DETAIL": return getInvoiceDetail(payload);
    case "UPDATE_INVOICE_STATUS": return updateInvoiceStatus(payload);
    case "CANCEL_INVOICE": return cancelInvoice(payload);
    case "SAVE_PAYMENT": return savePayment(payload);
    case "GET_PAYMENTS": return getPayments(payload);
    case "EXPORT_BACKUP_JSON": return exportBackupJson();
    case "EXPORT_CSV": return exportCsv(payload);
    default:
      throw new Error("Unknown action: " + action);
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body");
  }
  return JSON.parse(e.postData.contents);
}

function getSpreadsheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("This Apps Script must be bound to the target Google Sheet");
  }
  return spreadsheet;
}

function getSheet(name) {
  return ensureSheet_(name);
}

function ensureSheet_(name) {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(name);
  var headers = SHEET_SCHEMAS[name];
  if (!headers) {
    throw new Error("Unknown sheet schema: " + name);
  }

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  var currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsReset = headers.some(function(header, index) {
    return currentHeaders[index] !== header;
  });
  if (needsReset) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function initDatabase() {
  return withLock_(function() {
    Object.keys(SHEET_SCHEMAS).forEach(ensureSheet_);
    seedSettings_();
    seedSampleData_();
    appendLog("INIT_DATABASE", "system", getSpreadsheet_().getId(), "สร้างชีตและข้อมูลดัมมี่เริ่มต้น", "system");
    return {
      spreadsheet_id: getSpreadsheet_().getId(),
      spreadsheet_name: getSpreadsheet_().getName(),
      sheets: Object.keys(SHEET_SCHEMAS)
    };
  });
}

function login_(payload) {
  var settings = getSettingsMap_();
  var username = String(payload.username || "");
  var password = String(payload.password || "");
  if (!username || !password) {
    throw new Error("Missing username or password");
  }
  if (!isAuthorizedCredential_(username, password, settings)) {
    throw new Error("Invalid username or password");
  }
  return { ok: true, user: username };
}

function authorize_(auth) {
  var settings = getSettingsMap_();
  var username = String(auth.username || auth.user || "");
  var password = String(auth.password || auth.pass || "");
  if (!isAuthorizedCredential_(username, password, settings)) {
    throw new Error("Unauthorized");
  }
}

function getSettings() {
  return getSettingsMap_();
}

function saveSettings(payload) {
  return withLock_(function() {
    var rows = readSheetObjects_("Settings");
    var map = objectFromRowsByKey_(rows, "key");
    Object.keys(payload).forEach(function(key) {
      var value = String(payload[key] === undefined ? "" : payload[key]);
      if (map[key]) {
        map[key].value = value;
        map[key].updated_at = nowText_();
      } else {
        rows.push({
          key: key,
          value: value,
          note: "",
          updated_at: nowText_()
        });
      }
    });
    writeObjects_("Settings", rows);
    appendLog("SAVE_SETTINGS", "settings", "settings", "อัปเดตการตั้งค่าระบบ", "admin");
    return getSettingsMap_();
  });
}

function getDashboardSummary(payload) {
  var month = normalizeBillingMonthValue_((payload && payload.month) || currentMonth_());
  var rooms = readSheetObjects_("Rooms");
  var invoices = readSheetObjects_("Invoices").filter(function(item) {
    return monthKey_(item.billing_month) === month;
  });
  var payments = readSheetObjectsSelective_("Payments", ["paid_amount", "paid_at"]).filter(function(item) {
    return String(item.paid_at || "").indexOf(month) === 0;
  });
  return {
    total_rooms: rooms.length,
    occupied_rooms: rooms.filter(function(item) { return item.status === "occupied"; }).length,
    vacant_rooms: rooms.filter(function(item) { return item.status === "vacant"; }).length,
    maintenance_rooms: rooms.filter(function(item) { return item.status === "maintenance"; }).length,
    bills_this_month: invoices.length,
    paid_bills: invoices.filter(function(item) { return item.status === "paid"; }).length,
    unpaid_bills: invoices.filter(function(item) { return item.status === "unpaid"; }).length,
    total_revenue: sumBy_(invoices, "total_amount"),
    received_amount: sumBy_(payments, "paid_amount"),
    outstanding_amount: invoices.filter(function(item) { return item.status !== "paid"; }).reduce(function(sum, item) {
      return sum + Number(item.total_amount || 0);
    }, 0)
  };
}

function getLogs(payload) {
  var limit = Number(payload.limit || 10);
  var rows = readSheetObjects_("Logs");
  rows.sort(function(a, b) {
    return String(b.created_at).localeCompare(String(a.created_at));
  });
  return { items: rows.slice(0, limit) };
}

function getRooms(payload) {
  var rows = readSheetObjects_("Rooms");
  var query = String(payload.query || "").toLowerCase().trim();
  var status = String(payload.status || "all");
  if (query) {
    rows = rows.filter(function(item) {
      return [item.room_no, item.tenant_name, item.phone].join(" ").toLowerCase().indexOf(query) !== -1;
    });
  }
  if (status !== "all") {
    rows = rows.filter(function(item) {
      return item.status === status;
    });
  }
  rows.sort(function(a, b) {
    return String(a.room_no).localeCompare(String(b.room_no));
  });
  return paginate_(rows, Number(payload.page || 1), Number(payload.pageSize || 20));
}

function getRoomDetail(payload) {
  return requireById_(readSheetObjects_("Rooms"), "room_id", String(payload.roomId || payload.room_id || ""), "Room not found");
}

function createRoom(payload) {
  return withLock_(function() {
    validateRoomPayload_(payload);
    var rows = readSheetObjects_("Rooms");
    var now = nowText_();
    var room = {
      room_id: makeId_("R"),
      room_no: String(payload.room_no || "").trim(),
      floor: String(payload.floor || "").trim(),
      status: String(payload.status || "vacant"),
      tenant_name: String(payload.tenant_name || "").trim(),
      phone: String(payload.phone || "").trim(),
      base_rent: Number(payload.base_rent || 0),
      common_fee: Number(payload.common_fee || 0),
      parking_fee: Number(payload.parking_fee || 0),
      internet_fee: Number(payload.internet_fee || 0),
      other_fee: Number(payload.other_fee || 0),
      note: String(payload.note || ""),
      created_at: now,
      updated_at: now
    };
    rows.push(room);
    writeObjects_("Rooms", rows);
    upsertTenantForRoom_(room);
    appendLog("CREATE_ROOM", "room", room.room_id, "เพิ่มห้อง " + room.room_no, "admin");
    return room;
  });
}

function updateRoom(payload) {
  return withLock_(function() {
    validateRoomPayload_(payload);
    var rows = readSheetObjects_("Rooms");
    var room = requireById_(rows, "room_id", String(payload.room_id || ""), "Room not found");
    room.room_no = String(payload.room_no || room.room_no);
    room.floor = String(payload.floor || room.floor);
    room.status = String(payload.status || room.status);
    room.tenant_name = String(payload.tenant_name || "");
    room.phone = String(payload.phone || "");
    room.base_rent = Number(payload.base_rent || 0);
    room.common_fee = Number(payload.common_fee || 0);
    room.parking_fee = Number(payload.parking_fee || 0);
    room.internet_fee = Number(payload.internet_fee || 0);
    room.other_fee = Number(payload.other_fee || 0);
    room.note = String(payload.note || "");
    room.updated_at = nowText_();
    writeObjects_("Rooms", rows);
    upsertTenantForRoom_(room);
    appendLog("UPDATE_ROOM", "room", room.room_id, "อัปเดตห้อง " + room.room_no, "admin");
    return room;
  });
}

function deleteRoom(payload) {
  return withLock_(function() {
    var roomId = String(payload.roomId || payload.room_id || "");
    var rows = readSheetObjects_("Rooms");
    var filtered = rows.filter(function(item) {
      return item.room_id !== roomId;
    });
    if (filtered.length === rows.length) {
      throw new Error("Room not found");
    }
    writeObjects_("Rooms", filtered);
    appendLog("DELETE_ROOM", "room", roomId, "ลบห้อง " + roomId, "admin");
    return { ok: true };
  });
}

function getPreviousMeter(payload) {
  var roomId = String(payload.roomId || payload.room_id || "");
  var month = normalizeBillingMonthValue_(payload.billingMonth || payload.billing_month || currentMonth_());
  var room = requireById_(readSheetObjects_("Rooms"), "room_id", roomId, "Room not found");
  var rows = readSheetObjects_("Meter_Readings").filter(function(item) {
    return item.room_id === roomId;
  }).sort(function(a, b) {
    return monthKey_(b.billing_month).localeCompare(monthKey_(a.billing_month));
  });
  var existing = rows.filter(function(item) { return monthKey_(item.billing_month) === month; })[0];
  var previous = rows.filter(function(item) { return monthKey_(item.billing_month) < month; })[0] || {};
  var settings = getSettingsMap_();
  return {
    room_id: roomId,
    room_no: room.room_no,
    billing_month: month,
    water_prev: Number(existing ? existing.water_prev : previous.water_current || 0),
    water_current: existing ? existing.water_current : "",
    electric_prev: Number(existing ? existing.electric_prev : previous.electric_current || 0),
    electric_current: existing ? existing.electric_current : "",
    water_rate: Number(existing ? existing.water_rate : settings.water_rate || 18),
    electric_rate: Number(existing ? existing.electric_rate : settings.electric_rate || 8)
  };
}

function saveMeterReading(payload) {
  return withLock_(function() {
    var data = normalizeMeterPayload_(payload);
    var rows = readSheetObjects_("Meter_Readings");
    var existing = rows.filter(function(item) {
      return item.room_id === data.room_id && monthKey_(item.billing_month) === data.billing_month;
    })[0];
    if (existing) {
      copyFields_(existing, data);
      existing.updated_at = nowText_();
    } else {
      rows.push(mergeObjects_({
        meter_id: makeId_("M"),
        recorded_at: nowText_(),
        updated_at: nowText_()
      }, data));
    }
    writeObjects_("Meter_Readings", rows);
    appendLog("SAVE_METER_READING", "meter", data.room_id, "บันทึกมิเตอร์ห้อง " + data.room_no + " เดือน " + data.billing_month, "admin");
    return { ok: true };
  });
}

function getMeterProgress(payload) {
  var month = normalizeBillingMonthValue_(payload.billingMonth || payload.billing_month || currentMonth_());
  var rooms = readSheetObjects_("Rooms").filter(function(item) {
    return item.status !== "disabled";
  });
  var readings = objectFromRowsByKey_(
    readSheetObjects_("Meter_Readings").filter(function(item) {
      return monthKey_(item.billing_month) === month;
    }),
    "room_id"
  );
  var done = 0;
  var items = rooms.map(function(room) {
    if (readings[room.room_id]) done += 1;
    return {
      room_id: room.room_id,
      room_no: room.room_no,
      status: room.status
    };
  });
  return {
    total: items.length,
    done: done,
    percent: items.length ? Math.round(done / items.length * 100) : 0,
    rooms: items
  };
}

function getMeterReadings(payload) {
  var month = normalizeBillingMonthValue_(payload.billingMonth || payload.billing_month || currentMonth_());
  return {
    items: readSheetObjects_("Meter_Readings").filter(function(item) {
      return monthKey_(item.billing_month) === month;
    })
  };
}

function generateInvoices(payload) {
  return withLock_(function() {
    var month = normalizeBillingMonthValue_(payload.billingMonth || payload.billing_month || currentMonth_());
    var rooms = readSheetObjects_("Rooms").filter(function(room) {
      return room.status === "occupied";
    });
    var meters = objectFromRowsByKey_(
      readSheetObjects_("Meter_Readings").filter(function(item) {
        return monthKey_(item.billing_month) === month;
      }),
      "room_id"
    );
    var tenants = objectFromRowsByKey_(
      readSheetObjects_("Tenants").filter(function(item) {
        return item.status !== "inactive";
      }),
      "room_id"
    );
    var charges = groupSumBy_(
      readSheetObjects_("Custom_Charges").filter(function(item) {
        return monthKey_(item.billing_month) === month && String(item.active).toUpperCase() === "TRUE";
      }),
      "room_id",
      "amount"
    );
    var rows = readSheetObjects_("Invoices");

    rooms.forEach(function(room) {
      var meter = meters[room.room_id] || {};
      var tenant = tenants[room.room_id] || {};
      var invoice = buildInvoiceData_(room, tenant, meter, charges[room.room_id] || 0, month);
      var existing = rows.filter(function(item) {
        return item.room_id === room.room_id && monthKey_(item.billing_month) === month;
      })[0];
      if (existing) {
        copyFields_(existing, invoice);
        existing.updated_at = nowText_();
      } else {
        rows.push(mergeObjects_({
          invoice_id: makeId_("I"),
          paid_amount: 0,
          status: "unpaid",
          created_at: nowText_(),
          paid_at: "",
          updated_at: nowText_(),
          note: ""
        }, invoice));
      }
    });

    writeObjects_("Invoices", rows);
    appendLog("GENERATE_INVOICES", "invoice", month, "สร้างใบแจ้งหนี้เดือน " + month, "admin");
    return { created: rooms.length };
  });
}

function getInvoices(payload) {
  var rows = readSheetObjects_("Invoices");
  var month = normalizeBillingMonthValue_(payload.month || currentMonth_());
  var status = String(payload.status || "all");
  var query = String(payload.query || "").toLowerCase().trim();
  if (month) {
    rows = rows.filter(function(item) {
      return monthKey_(item.billing_month) === month;
    });
  }
  if (status !== "all") {
    rows = rows.filter(function(item) {
      return item.status === status;
    });
  }
  if (query) {
    rows = rows.filter(function(item) {
      return [item.invoice_no, item.room_no, item.tenant_name].join(" ").toLowerCase().indexOf(query) !== -1;
    });
  }
  rows.sort(function(a, b) {
    return monthKey_(b.billing_month).localeCompare(monthKey_(a.billing_month)) || String(a.room_no).localeCompare(String(b.room_no));
  });
  return paginate_(rows, Number(payload.page || 1), Number(payload.pageSize || 20));
}

function getInvoiceDetail(payload) {
  var invoiceId = String(payload.invoiceId || payload.invoice_id || "");
  var invoice = requireById_(readSheetObjects_("Invoices"), "invoice_id", invoiceId, "Invoice not found");
  var payments = readSheetObjects_("Payments").filter(function(item) {
    return item.invoice_id === invoiceId;
  });
  return mergeObjects_(invoice, { payments: payments });
}

function updateInvoiceStatus(payload) {
  return withLock_(function() {
    var rows = readSheetObjects_("Invoices");
    var invoice = requireById_(rows, "invoice_id", String(payload.invoice_id || payload.invoiceId || ""), "Invoice not found");
    invoice.status = String(payload.status || invoice.status || "unpaid");
    invoice.updated_at = nowText_();
    writeObjects_("Invoices", rows);
    appendLog("UPDATE_INVOICE_STATUS", "invoice", invoice.invoice_id, "เปลี่ยนสถานะใบแจ้งหนี้เป็น " + invoice.status, "admin");
    return invoice;
  });
}

function cancelInvoice(payload) {
  payload.status = "cancelled";
  return updateInvoiceStatus(payload);
}

function savePayment(payload) {
  return withLock_(function() {
    var invoiceId = String(payload.invoice_id || payload.invoiceId || "");
    var invoices = readSheetObjects_("Invoices");
    var invoice = requireById_(invoices, "invoice_id", invoiceId, "Invoice not found");
    var payment = {
      payment_id: makeId_("P"),
      invoice_id: invoice.invoice_id,
      invoice_no: invoice.invoice_no,
      room_id: invoice.room_id,
      room_no: invoice.room_no,
      tenant_name: invoice.tenant_name,
      paid_amount: Number(payload.paid_amount || invoice.total_amount || 0),
      method: String(payload.method || "cash"),
      slip_name: String(payload.slip_name || ""),
      slip_base64: String(payload.slip_base64 || ""),
      paid_at: String(payload.paid_at || nowText_()),
      received_by: String(payload.received_by || "admin"),
      note: String(payload.note || ""),
      created_at: nowText_()
    };
    writeAppendObject_("Payments", payment);
    invoice.status = "paid";
    invoice.paid_amount = payment.paid_amount;
    invoice.paid_at = payment.paid_at;
    invoice.updated_at = nowText_();
    writeObjects_("Invoices", invoices);
    appendLog("SAVE_PAYMENT", "invoice", invoice.invoice_id, "รับชำระห้อง " + invoice.room_no + " จำนวน " + payment.paid_amount + " บาท", "admin");
    return stripPaymentBase64_(payment);
  });
}

function getPayments() {
  return {
    items: readSheetObjectsSelective_("Payments", ["payment_id", "invoice_id", "invoice_no", "room_no", "tenant_name", "paid_amount", "method", "slip_name", "paid_at", "received_by", "note", "created_at"])
  };
}

function exportBackupJson() {
  var data = {};
  Object.keys(SHEET_SCHEMAS).forEach(function(name) {
    data[name] = readSheetObjects_(name);
  });
  return data;
}

function exportCsv(payload) {
  var month = normalizeBillingMonthValue_(payload.month || currentMonth_());
  var rows = getInvoices({ month: month, status: payload.status || "all", query: payload.query || "", page: 1, pageSize: 10000 }).items;
  var headers = ["invoice_no", "billing_month", "room_no", "tenant_name", "total_amount", "paid_amount", "status"];
  var csv = [headers.join(",")].concat(rows.map(function(row) {
    return headers.map(function(header) {
      return csvCell_(row[header]);
    }).join(",");
  })).join("\n");
  return {
    filename: "easy-rent-bill-" + month + ".csv",
    content: csv
  };
}

function seedSettings_() {
  if (readSheetObjects_("Settings").length) return;
  writeObjects_("Settings", [
    settingRow_("dorm_name", "Easy Rent Bill", "Dormitory name"),
    settingRow_("dorm_address", "123 ถนนสุขุมวิท แขวงคลองตัน กรุงเทพฯ", "Dormitory address"),
    settingRow_("dorm_phone", "02-123-4567", "Phone number"),
    settingRow_("water_rate", "18", "Baht per unit"),
    settingRow_("electric_rate", "8", "Baht per unit"),
    settingRow_("default_base_rent", "3500", "Default rent"),
    settingRow_("default_common_fee", "300", "Default common fee"),
    settingRow_("bank_name", "กสิกรไทย", "Bank name"),
    settingRow_("bank_account_name", "หอพักใจดี", "Account name"),
    settingRow_("bank_account_no", "012-3-45678-9", "Account number"),
    settingRow_("promptpay_id", "0812345678", "PromptPay ID"),
    settingRow_("invoice_prefix", "INV", "Invoice prefix"),
    settingRow_("invoice_extra_label", "ค่าใช้จ่ายเพิ่มเติม", "Label for custom charge line"),
    settingRow_("invoice_footer_note", "", "Invoice footer note / policy"),
    settingRow_("allowed_credentials", "", "One username,password per line"),
    settingRow_("payment_default_method", "transfer", "Default payment method tab"),
    settingRow_("admin_user", "admin", "Default admin user"),
    settingRow_("admin_password", "admin1234", "Default admin password")
  ]);
}

function seedSampleData_() {
  if (readSheetObjects_("Rooms").length) return;
  var now = nowText_();
  var month = currentMonth_();

  writeObjects_("Rooms", [
    roomRow_("R101", "101", "1", "occupied", "สมชาย ใจดี", "0811111111", 3500, 300, 0, 250, 0, now),
    roomRow_("R102", "102", "1", "vacant", "", "", 3500, 300, 0, 250, 0, now),
    roomRow_("R201", "201", "2", "occupied", "มาลี รักดี", "0822222222", 4000, 300, 500, 250, 0, now),
    roomRow_("R202", "202", "2", "occupied", "วิชัย ใจมั่น", "0833333333", 4000, 300, 0, 250, 200, now),
    roomRow_("R203", "203", "2", "maintenance", "", "", 4800, 300, 0, 250, 0, now)
  ]);

  writeObjects_("Tenants", [
    tenantRow_("T101", "R101", "สมชาย ใจดี", "0811111111", month + "-01", now),
    tenantRow_("T201", "R201", "มาลี รักดี", "0822222222", month + "-01", now),
    tenantRow_("T202", "R202", "วิชัย ใจมั่น", "0833333333", month + "-01", now)
  ]);

  writeObjects_("Meter_Readings", [
    meterRow_("M101", month, "R101", "101", 120, 125, 18, 850, 900, 8, now),
    meterRow_("M201", month, "R201", "201", 200, 208, 18, 1000, 1062, 8, now)
  ]);

  writeObjects_("Custom_Charges", [
    {
      charge_id: "C202",
      room_id: "R202",
      room_no: "202",
      billing_month: month,
      name: "ค่าทำความสะอาด",
      amount: 150,
      type: "one_time",
      active: "TRUE",
      created_at: now,
      updated_at: now
    }
  ]);

  writeObjects_("Invoices", [
    mergeObjects_({
      invoice_id: "I101",
      paid_amount: 0,
      status: "unpaid",
      created_at: now,
      paid_at: "",
      updated_at: now,
      note: ""
    }, buildInvoiceData_(
      roomRow_("R101", "101", "1", "occupied", "สมชาย ใจดี", "0811111111", 3500, 300, 0, 250, 0, now),
      tenantRow_("T101", "R101", "สมชาย ใจดี", "0811111111", month + "-01", now),
      meterRow_("M101", month, "R101", "101", 120, 125, 18, 850, 900, 8, now),
      0,
      month
    )),
    mergeObjects_({
      invoice_id: "I201",
      paid_amount: 5690,
      status: "paid",
      created_at: now,
      paid_at: now,
      updated_at: now,
      note: ""
    }, buildInvoiceData_(
      roomRow_("R201", "201", "2", "occupied", "มาลี รักดี", "0822222222", 4000, 300, 500, 250, 0, now),
      tenantRow_("T201", "R201", "มาลี รักดี", "0822222222", month + "-01", now),
      meterRow_("M201", month, "R201", "201", 200, 208, 18, 1000, 1062, 8, now),
      0,
      month
    )),
    mergeObjects_({
      invoice_id: "I202",
      paid_amount: 0,
      status: "unpaid",
      created_at: now,
      paid_at: "",
      updated_at: now,
      note: ""
    }, buildInvoiceData_(
      roomRow_("R202", "202", "2", "occupied", "วิชัย ใจมั่น", "0833333333", 4000, 300, 0, 250, 200, now),
      tenantRow_("T202", "R202", "วิชัย ใจมั่น", "0833333333", month + "-01", now),
      {},
      150,
      month
    ))
  ]);

  writeObjects_("Payments", [
    {
      payment_id: "P201",
      invoice_id: "I201",
      invoice_no: makeInvoiceNo_(month, "201", "INV"),
      room_id: "R201",
      room_no: "201",
      tenant_name: "มาลี รักดี",
      paid_amount: 5690,
      method: "cash",
      slip_name: "",
      slip_base64: "",
      paid_at: now,
      received_by: "admin",
      note: "ข้อมูลทดสอบ",
      created_at: now
    }
  ]);

  writeObjects_("Logs", [
    logRow_("L1", "SAVE_PAYMENT", "invoice", "I201", "ห้อง 201 ชำระเงินเรียบร้อยแล้ว", now),
    logRow_("L2", "GENERATE_INVOICES", "invoice", month, "สร้างใบแจ้งหนี้รอบเดือน " + month, now),
    logRow_("L3", "SAVE_METER_READING", "meter", "M101", "บันทึกมิเตอร์ห้อง 101", now)
  ]);
}

function settingRow_(key, value, note) {
  return {
    key: key,
    value: value,
    note: note,
    updated_at: nowText_()
  };
}

function roomRow_(roomId, roomNo, floor, status, tenantName, phone, baseRent, commonFee, parkingFee, internetFee, otherFee, now) {
  return {
    room_id: roomId,
    room_no: roomNo,
    floor: floor,
    status: status,
    tenant_name: tenantName,
    phone: phone,
    base_rent: baseRent,
    common_fee: commonFee,
    parking_fee: parkingFee,
    internet_fee: internetFee,
    other_fee: otherFee,
    note: "",
    created_at: now,
    updated_at: now
  };
}

function tenantRow_(tenantId, roomId, name, phone, startDate, now) {
  return {
    tenant_id: tenantId,
    room_id: roomId,
    name: name,
    phone: phone,
    start_date: startDate,
    end_date: "",
    status: "active",
    created_at: now,
    updated_at: now
  };
}

function meterRow_(meterId, month, roomId, roomNo, waterPrev, waterCurrent, waterRate, electricPrev, electricCurrent, electricRate, now) {
  return {
    meter_id: meterId,
    billing_month: month,
    room_id: roomId,
    room_no: roomNo,
    water_prev: waterPrev,
    water_current: waterCurrent,
    water_unit: waterCurrent - waterPrev,
    water_rate: waterRate,
    water_amount: (waterCurrent - waterPrev) * waterRate,
    electric_prev: electricPrev,
    electric_current: electricCurrent,
    electric_unit: electricCurrent - electricPrev,
    electric_rate: electricRate,
    electric_amount: (electricCurrent - electricPrev) * electricRate,
    recorded_at: now,
    updated_at: now,
    note: ""
  };
}

function logRow_(logId, action, refType, refId, detail, now) {
  return {
    log_id: logId,
    action: action,
    ref_type: refType,
    ref_id: refId,
    detail: detail,
    created_at: now,
    user: "admin"
  };
}

function buildInvoiceData_(room, tenant, meter, customAmount, month) {
  var data = {
    invoice_no: makeInvoiceNo_(month, room.room_no, getSettingsMap_().invoice_prefix || "INV"),
    billing_month: month,
    room_id: room.room_id,
    room_no: room.room_no,
    tenant_id: tenant.tenant_id || room.room_id,
    tenant_name: tenant.name || room.tenant_name || "",
    rent_amount: Number(room.base_rent || 0),
    common_fee: Number(room.common_fee || 0),
    parking_fee: Number(room.parking_fee || 0),
    internet_fee: Number(room.internet_fee || 0),
    other_fee: Number(room.other_fee || 0),
    water_amount: Number(meter.water_amount || 0),
    electric_amount: Number(meter.electric_amount || 0),
    custom_amount: Number(customAmount || 0),
    total_amount: 0
  };
  data.total_amount =
    data.rent_amount +
    data.common_fee +
    data.parking_fee +
    data.internet_fee +
    data.other_fee +
    data.water_amount +
    data.electric_amount +
    data.custom_amount;
  return data;
}

function getSettingsMap_() {
  return readSheetObjects_("Settings").reduce(function(acc, row) {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

function readSheetObjects_(sheetName) {
  var sheet = ensureSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = normalizeSheetValue_(header, row[index]);
    });
    return obj;
  });
}

function readSheetObjectsSelective_(sheetName, selectedHeaders) {
  var sheet = ensureSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var headerMap = headers.reduce(function(acc, header, index) {
    acc[header] = index + 1;
    return acc;
  }, {});
  var columns = selectedHeaders.map(function(header) {
    return sheet.getRange(2, headerMap[header], lastRow - 1, 1).getValues();
  });
  var rows = [];
  for (var rowIndex = 0; rowIndex < lastRow - 1; rowIndex += 1) {
    var row = {};
    selectedHeaders.forEach(function(header, headerIndex) {
      row[header] = normalizeSheetValue_(header, columns[headerIndex][rowIndex][0]);
    });
    rows.push(row);
  }
  return rows;
}

function writeObjects_(sheetName, rows) {
  var sheet = ensureSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  if (!rows.length) return;
  var values = rows.map(function(row) {
    return headers.map(function(header) {
      return row[header] !== undefined ? row[header] : "";
    });
  });
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function writeAppendObject_(sheetName, row) {
  var sheet = ensureSheet_(sheetName);
  var headers = SHEET_SCHEMAS[sheetName];
  sheet.appendRow(headers.map(function(header) {
    return row[header] !== undefined ? row[header] : "";
  }));
}

function appendLog(action, refType, refId, detail, user) {
  writeAppendObject_("Logs", {
    log_id: makeId_("L"),
    action: action,
    ref_type: refType,
    ref_id: refId,
    detail: detail,
    created_at: nowText_(),
    user: user || "system"
  });
}

function withLock_(fn) {
  var lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function nowText_() {
  return Utilities.formatDate(new Date(), getAppTimeZone_(), "yyyy-MM-dd HH:mm:ss");
}

function currentMonth_() {
  return Utilities.formatDate(new Date(), getAppTimeZone_(), "yyyy-MM");
}

function makeId_(prefix) {
  return prefix + new Date().getTime() + Math.floor(Math.random() * 1000);
}

function makeInvoiceNo_(month, roomNo, prefix) {
  return prefix + "-" + month.replace("-", "") + "-" + roomNo;
}

function validateRoomPayload_(payload) {
  if (!String(payload.room_no || "").trim()) throw new Error("Room Number is required");
  if (!String(payload.floor || "").trim()) throw new Error("Floor is required");
}

function normalizeMeterPayload_(payload) {
  var waterPrev = Number(payload.waterPrev || payload.water_prev || 0);
  var waterCurrent = Number(payload.waterCurrent || payload.water_current || 0);
  var electricPrev = Number(payload.electricPrev || payload.electric_prev || 0);
  var electricCurrent = Number(payload.electricCurrent || payload.electric_current || 0);
  if (waterCurrent < waterPrev) throw new Error("Current water meter cannot be lower than previous meter");
  if (electricCurrent < electricPrev) throw new Error("Current electric meter cannot be lower than previous meter");
  var settings = getSettingsMap_();
  var waterRate = Number(payload.waterRate || payload.water_rate || settings.water_rate || 18);
  var electricRate = Number(payload.electricRate || payload.electric_rate || settings.electric_rate || 8);
  return {
    billing_month: normalizeBillingMonthValue_(payload.billingMonth || payload.billing_month || currentMonth_()),
    room_id: String(payload.roomId || payload.room_id || ""),
    room_no: String(payload.roomNo || payload.room_no || ""),
    water_prev: waterPrev,
    water_current: waterCurrent,
    water_unit: waterCurrent - waterPrev,
    water_rate: waterRate,
    water_amount: (waterCurrent - waterPrev) * waterRate,
    electric_prev: electricPrev,
    electric_current: electricCurrent,
    electric_unit: electricCurrent - electricPrev,
    electric_rate: electricRate,
    electric_amount: (electricCurrent - electricPrev) * electricRate,
    note: String(payload.note || "")
  };
}

function upsertTenantForRoom_(room) {
  var rows = readSheetObjects_("Tenants");
  var existing = rows.filter(function(item) {
    return item.room_id === room.room_id;
  })[0];
  if (existing) {
    existing.name = room.tenant_name || "";
    existing.phone = room.phone || "";
    existing.status = room.tenant_name ? "active" : "vacant";
    existing.updated_at = nowText_();
  } else if (room.tenant_name) {
    rows.push({
      tenant_id: makeId_("T"),
      room_id: room.room_id,
      name: room.tenant_name,
      phone: room.phone || "",
      start_date: currentMonth_() + "-01",
      end_date: "",
      status: "active",
      created_at: nowText_(),
      updated_at: nowText_()
    });
  }
  writeObjects_("Tenants", rows);
}

function paginate_(items, page, pageSize) {
  var total = items.length;
  var totalPages = Math.max(1, Math.ceil(total / pageSize));
  var currentPage = Math.min(Math.max(page, 1), totalPages);
  var start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: total,
    page: currentPage,
    pageSize: pageSize,
    totalPages: totalPages
  };
}

function objectFromRowsByKey_(rows, key) {
  return rows.reduce(function(acc, row) {
    acc[row[key]] = row;
    return acc;
  }, {});
}

function groupSumBy_(rows, groupKey, amountKey) {
  return rows.reduce(function(acc, row) {
    var key = row[groupKey];
    acc[key] = (acc[key] || 0) + Number(row[amountKey] || 0);
    return acc;
  }, {});
}

function requireById_(rows, key, value, message) {
  var row = rows.filter(function(item) {
    return String(item[key]) === String(value);
  })[0];
  if (!row) throw new Error(message);
  return row;
}

function sumBy_(rows, key) {
  return rows.reduce(function(sum, row) {
    return sum + Number(row[key] || 0);
  }, 0);
}

function csvCell_(value) {
  return '"' + String(value === undefined ? "" : value).replace(/"/g, '""') + '"';
}

function stripPaymentBase64_(payment) {
  var clone = {};
  Object.keys(payment).forEach(function(key) {
    if (key !== "slip_base64") clone[key] = payment[key];
  });
  return clone;
}

function mergeObjects_(a, b) {
  var output = {};
  Object.keys(a).forEach(function(key) { output[key] = a[key]; });
  Object.keys(b).forEach(function(key) { output[key] = b[key]; });
  return output;
}

function copyFields_(target, source) {
  Object.keys(source).forEach(function(key) {
    target[key] = source[key];
  });
}

function normalizeSheetValue_(header, value) {
  if (header === "billing_month") {
    return normalizeBillingMonthValue_(value);
  }
  if (value instanceof Date) {
    if (/_at$/.test(header)) {
      return Utilities.formatDate(value, getAppTimeZone_(), "yyyy-MM-dd HH:mm:ss");
    }
    if (/_date$/.test(header)) {
      return Utilities.formatDate(value, getAppTimeZone_(), "yyyy-MM-dd");
    }
  }
  return value;
}

function normalizeBillingMonthValue_(value) {
  var timezone = getAppTimeZone_();
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (value instanceof Date) {
    return Utilities.formatDate(value, timezone, "yyyy-MM");
  }
  var text = String(value).trim();
  if (!text) {
    return "";
  }
  if (/^\d{4}-\d{2}$/.test(text)) {
    return text;
  }
  if (/[T ]\d{2}:\d{2}/.test(text) || /Z$/.test(text)) {
    var parsedWithTime = new Date(text);
    if (!isNaN(parsedWithTime.getTime())) {
      return Utilities.formatDate(parsedWithTime, timezone, "yyyy-MM");
    }
  }
  var compactDateMatch = text.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (compactDateMatch) {
    return compactDateMatch[1] + "-" + compactDateMatch[2];
  }
  var slashDateMatch = text.match(/^(\d{4})\/(\d{1,2})(?:\/\d{1,2})?$/);
  if (slashDateMatch) {
    return slashDateMatch[1] + "-" + pad2_(slashDateMatch[2]);
  }
  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, timezone, "yyyy-MM");
  }
  return text;
}

function monthKey_(value) {
  return normalizeBillingMonthValue_(value);
}

function pad2_(value) {
  return ("0" + String(value)).slice(-2);
}

function getAppTimeZone_() {
  try {
    return getSpreadsheet_().getSpreadsheetTimeZone() || Session.getScriptTimeZone() || "Asia/Bangkok";
  } catch (error) {
    return Session.getScriptTimeZone() || "Asia/Bangkok";
  }
}

function isAuthorizedCredential_(username, password, settings) {
  return listAuthorizedCredentials_(settings).some(function(item) {
    return item.username === username && item.password === password;
  });
}

function listAuthorizedCredentials_(settings) {
  var credentials = [{
    username: String(settings.admin_user || "admin").trim(),
    password: String(settings.admin_password || "admin1234")
  }];
  return credentials.concat(parseCredentialRows_(settings.allowed_credentials));
}

function parseCredentialRows_(rawText) {
  return String(rawText || "").split(/\r?\n/).map(function(line) {
    var text = String(line || "").trim();
    if (!text) return null;
    var delimiterIndex = text.indexOf(",");
    if (delimiterIndex < 0) {
      delimiterIndex = text.indexOf("|");
    }
    if (delimiterIndex < 0) return null;
    var username = text.slice(0, delimiterIndex).trim();
    var password = text.slice(delimiterIndex + 1).trim();
    if (!username || !password) return null;
    return {
      username: username,
      password: password
    };
  }).filter(function(item) {
    return item !== null;
  });
}
