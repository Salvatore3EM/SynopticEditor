//GLOBAL
var init = true;
var areaList = [];
var currentAreaId = 0;
var currentSinottico = "";
var _typeStationSelected = "";

//Is the string that must be removed about bug Error Chrome ver 74>>>
var _nsexclude = 'xmlns:svg="http://www.w3.org/2000/svg"';

$(document).ready(function () {
  $("#tools_left").hide();

  dialogAreaSelection();
});

$(document).ajaxStop(function () {
  if (init) {
    //LEFT BUTTONS MENU
    //$('#tool_select').hide();
    //$('#tool_fhpath').hide();
    //$('#tool_line').hide();
    //$('#tools_line_show').hide();
    //$('#tools_rect_show').hide();
    //$('#tools_ellipse_show').hide();
    //$('#tool_path').hide();
    //$('#tool_text').hide();
    $("#tool_image").hide();
    $("#tool_zoom").hide();
    $("#tools_shapelib_show").hide();
    $("#tool_polygon").hide();
    $("#tool_star").hide();
    $("#tool_eyedropper").hide();
    $("#ext-panning").hide();

    //MAIN BUTTON MENU
    // $('#tool_clear').hide();
    // $('#tool_open').hide();
    $("#tool_import").hide();
    // $('#tool_save').hide();
    // $('#tool_saveAs').hide();
    $("#tool_imagelib").hide();
    $("#tool_export").hide();
    // $('#tool_docprops').hide();
    $("#main_menu p").hide();
    $('[type="file"]').remove();

    $("#tools_left").show();
    init = false;
  } else {
    $("#tools_line").hide();
    $("#tools_rect").hide();
    $("#tools_ellipse").hide();
    $("#tools_shapelib").hide();
  }
});

function managementSynopticObject(action, vars) {
  //"toolButtonStateUpdate" --> no vars
  //"elementChanged" --> vars.elems[0].id
  //"mouseDown" --> vars.selectedElements[0].id

  var id_selected = "";
  switch (action) {
    case "mouseDown":
      if (
        vars.selectedElements[0] != null &&
        vars.selectedElements[0] != "undefined"
      )
        id_selected = $("#" + vars.selectedElements[0].id);
      break;
    case "elementChanged":
      id_selected = $("#" + vars.elems[0].id);
      break;
    case "selectedChanged":
    case "toolButtonStateUpdate":
    case "mouseMove":
    case "mouseUp":
      break;
    default:
  }

  if (id_selected.length > 0) {
    $("#elem_id").prop("disabled", true);
    $("#elem_class").prop("disabled", true);
    if (id_selected.attr("type_custom") == "1") {
      $("#tool_make_link").html(
        '<img class="svg_icon" src="images/properties.svg" width="24px" height="24px">'
      );
      $("#tool_make_link").show();
      $("#tool_make_link").attr("data-custom-typeProperties", "true");
      $("#tool_make_link").attr("title", "Propietà oggetto");
      $("#tool_make_link img").attr("src", "images/properties.svg");
      $("#tool_make_link img").attr("width", "24px");
      $("#tool_make_link img").attr("height", "24px");
      $("#container_panel").hide();
      $("#g_panel").hide();
      $("#tools_bottom_2").hide();
      $("#tools_bottom_3").hide();
    } else {
      $("#tool_make_link").hide();
      $("#tool_make_link").attr("data-custom-typeProperties", "false");
      $("#tools_bottom_2").show();
      $("#tools_bottom_3").show();
    }
    $("#tool_clone").hide();
    $("#idLabel").css("width", "30%");
    $("#classLabel").css("width", "29%");
    $("#elem_class").css("width", "65%");
  }

  $("#idLabel").css("width", "30%");
  $("#classLabel").css("width", "29%");
  $("#elem_class").css("width", "65%");
}

function saveManagement() {
  if (currentSinottico.length > 0) {
    //save

    //get synoptic's SVG
    var svg = svgCanvas.getSvgString();

    //Is important to remove only the first string founded
    svg = svg.replace(_nsexclude, "");
    var updateSynopticParam = new updateSynopticRequest(currentSinottico, svg);
    updateSynoptic(updateSynopticParam, function (data) {
      //check result in errorList
      var resultId = data.ErrorList[0].Id;
      var resultDescription = data.ErrorList[0].Description;
      switch (resultId) {
        case 1:
          var title = "Save successful";
          break;
        default:
          var title = "Save error";
          return;
      }
      dialogInformation(title, resultDescription);
    });
  } else {
    //saveAs
    dialogSaveAs();
  }
}

function loadManagement(svg) {
  var type = "load_svg";
  switch (type) {
    case "load_svg":
      svgCanvas.clear();
      svgCanvas.setSvgString(svg);
      svgEditor.updateCanvas();
      break;
    //case 'import_svg':
    //    svgCanvas.importSvgString(xmlstr);
    //    svgEditor.updateCanvas();
    //    break;
    //case 'import_img':
    //    svgCanvas.setGoodImage(str64);
    //    break;
  }

  //fit to canvas
  svgCanvas.zoomChanged(window, "canvas");
}

//DIALOG

function dialogAreaSelection() {
  //set custom size of dialogbox
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-areaSelection");

  //insert messagge area on top
  $('<div id="dialoxBox-message">Select the plant area.</div>').insertBefore(
    "#dialog_content"
  );

  //content HTML
  var html = "<div>";
  html +=
    '<ul id="loader"><li>&nbsp;</li><li><img src="images/loader.gif" height="20" width="20"></li><li>&nbsp;</li></ul>';
  html += '<select id="areaList" style="display: none;">';
  html += '<option value="0">Select...</option>';
  html += "</select></div>";
  $("#dialog_content").html(html);

  //buttons HTML
  var buttons_html = "";
  buttons_html += '<input type="button" value="OK" id="dialogBox-ok">';
  $("#dialog_buttons").html(buttons_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //if areaList is Empty call webInterface
  if (areaList.length == 0) {
    //var _modelTreeRequest = new modelTreeRequest();

    getPlantTree(null, function (data) {
      if (data.ErrorList.length == 0) {
        areaList = data.EquipmentList[0].Children;

        //append in left menu the synoptic's custom button
        $("#tools_left").append(
          '<div id="synopticObjList" class="tool_button" title="MOM Synoptic Object List">MOM LIB</div>'
        );
        $("#synopticObjList").click(dialogMOMLibrary);

        //set saveButtons' icon
        $("#tool_save div").html(
          '<img src="images/save.png" height="24" width="24">'
        );
        $("#tool_saveAs div").html(
          '<img src="images/saveAs.png" height="26" width="26" Style="margin-left: -2px;">'
        );

        populateSelect();
      } else {
        //force user to realod th editor
        var err = data.ErrorList[0];
        $("#dialoxBox-message")
          .fadeOut(function () {
            $(this).html("! saveSynoptic() " + err.Description + " !");
          })
          .fadeIn();
        console.log(err);
      }
    });
  } else {
    populateSelect();
  }

  //set event buttons dialog box
  $("#dialogBox-ok").click(function () {
    if ($("#areaList option:selected").val() != 0) {
      currentAreaId = parseInt($("#areaList option:selected").val());

      //set custom layer
      removeDefaultLayer();
      setSynopticLayer("Base", true);

      closeDialog();
    } else {
      $("#dialoxBox-message")
        .fadeOut(function () {
          $(this).html("! area not selected !");
        })
        .fadeIn();
    }
  });

  function populateSelect() {
    //populate select areaList
    $.each(areaList, function () {
      $("#areaList").append(
        '<option value="' +
          this.EquipmentId +
          '">' +
          this.EquipmentLongDescription +
          "</option>"
      );
    });

    $("#loader").hide();
    $("#areaList").show();
  }
}

function dialogMOMLibrary(e) {
  //set custom size of dialogbox
  $("#dialog_container").addClass("dialogBox-plantSize");
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-plantSize");

  //insert messagge area on top
  $(
    '<div id="dialoxBox-message"> Select the synoptic object to insert </div>'
  ).insertBefore("#dialog_content");

  //set dialog content
  var html =
    '<div id="synoptic-btnList" style="width: 100%; text-align: center;">';

  /* Helper */
  //To add a new button with a new synoptic obj from fileName like a ObjName_small.svg use this template:
  //html += addSynopticObj("[labelName]", "[ObjName]", sizeSmall, sizeMedium, sizeLarge);
  //html += addSynopticObj("Counter", "Counter", false, true, false);
  html += addSynopticObj("Line", "Line", false, true, false);
  html += addSynopticObj("Info", "Info", false, true, false);
  html += addSynopticObj("Status Square", "StatusR", false, true, false);
  html += addSynopticObj("Status List", "StatusList", false, true, false);
  html += addSynopticObj(
    "Status List Service Connector",
    "StatusListServiceConnector",
    false,
    true,
    false
  );
  html += addSynopticObj("Status Thread", "StatusThread", false, true, false);
  html += addSynopticObj(
    "Status CapStation",
    "StatusCapStation",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status CapStation Service Connector",
    "StatusCapStationServiceConnector",
    false,
    true,
    false
  );
  html += addSynopticObj("Status Seats", "StatusSeats", false, true, false);
  html += addSynopticObj(
    "Status Support Connector",
    "StatusSupportConnector",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status CpStation",
    "StatusCpStation",
    false,
    true,
    false
  );
  html += addSynopticObj("Status Camera", "StatusCamera", false, true, false);
  html += addSynopticObj(
    "Status Camera Service Connector",
    "StatusCameraServiceConnector",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status TanksBumper",
    "StatusTanksBumper",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status Extemporary",
    "StatusExtemporary",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status Extemporary OP",
    "StatusExtemporaryOP",
    false,
    true,
    false
  );
  html += addSynopticObj(
    "Status PickToLight",
    "StatusPickToLight",
    false,
    true,
    false
  );
  html += addSynopticObj("Status Sniffer", "StatusSniffer", false, true, false);
  html += addSynopticObj(
    "Status SetPoint",
    "StatusSetPoint",
    false,
    true,
    false
  );
  html += addSynopticObj("Sequence Alarm", "SequenceAlarm", false, true, false);
  html += addSynopticObj(
    "Status Dashboard",
    "StatusDashboard",
    false,
    true,
    false
  );
  html += addSynopticObj("Battery Pack", "BatteryPack", false, true, false);
  html += addSynopticObj(
    "Battery Pack Line",
    "BatteryPackLine",
    false,
    true,
    false
  );
  html += addSynopticObj("Station Battery Pack", "Station", false, true, false);
  html += addSynopticObj(
    "Counter Battery Pack",
    "BatteryPackCounter",
    false,
    true,
    false
  );
  html += addSynopticObj("Andon", "Andon", false, true, false);
  html += addSynopticObj("OT", "OT", false, true, false);
  html += addSynopticObj(
    "BatteryPackAGV",
    "BatteryPackAGV",
    false,
    true,
    false
  );
  html += addSynopticObj("StopLightIn", "StopLightIn", false, true, false);
  html += addSynopticObj("StopLightOut", "StopLightOut", false, true, false);
  html += addSynopticObj("Cella", "Cella", false, true, false);

  /*********/

  html +=
    '<div id="svgPreview" style="display: block; position: fixed; bottom: 0; right: 0; border: dotted black 1px; background: white;"><div id="area"></div></div>';
  $("#dialog_content").html(html);

  setSynopticObjToButtons();
  setPreviewOnObjLabel();

  //add dialog footer content
  var footer_html = "";
  footer_html += "<div>";
  footer_html += '<input type="button" value="CLOSE" id="dialogBox-cancel">';
  footer_html += "</div>";
  $("#dialog_buttons").html(footer_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //set event buttons dialog box
  $("#dialogBox-cancel").click(function () {
    closeDialog();
  });

  function addSynopticObj(objName, fileName, isSmall, isMedium, isLarge) {
    var row =
      '<ul style="padding: 0; margin: 0; width: 100%; list-style: none;">';
    row += '<li style="float: left; padding: 5px 0; width: 100%;"></li>'; //line separator
    row += "</ul>";
    row += '<ul style="padding: 0; margin: 0; width: 100%; list-style: none;">';
    row +=
      '<li class="svgObjLabel" data-previewFileName="' +
      fileName +
      '_Medium" style="float: left; width: 35%; text-align: left;">&nbsp;' +
      objName +
      "</li>";
    row +=
      '<li style="float: left; width: 20%;"><button data-fileName="' +
      fileName +
      '_Small" style="width: 80%; visibility:' +
      (isSmall ? "visible" : "hidden") +
      ';">Small</button></li>';
    row +=
      '<li style="float: left; width: 20%;"><button data-fileName="' +
      fileName +
      '_Medium" style="width: 80%; visibility:' +
      (isMedium ? "visible" : "hidden") +
      ';">Medium</button></li>';
    row +=
      '<li style="float: left; width: 20%;"><button data-fileName="' +
      fileName +
      '_Large" style="width: 80%; visibility:' +
      (isLarge ? "visible" : "hidden") +
      ';">Large</button></li>';
    row += "</ul>";

    return row;
  }

  function setSynopticObjToButtons(e) {
    $.each($("#synoptic-btnList").find("button"), function () {
      if ($(this).css("visibility") == "visible") {
        var url = location.origin + _global.pathCustomSvgObj;
        var button = $(this);
        var fileName = button.attr("data-fileName") + ".svg";

        //get object's svg
        $.get(
          url + fileName,
          function (data) {
            button.click(function () {
              closeDialog();
              svgCanvas.importCustomSvg(data);

              switch (fileName.split("_")[0]) {
                case "Line":
                  return;
                //case "MultiLineCounters":
                //    dialogMultiLineCountersProperties();
                //    break;
                case "Cap":
                  //dialogTransitStationProperies();
                  break;
                default:
                  _typeStationSelected =
                    fileName.indexOf("Large") >= 0 ? "LARGE" : "MEDIUM";
                  dialogSynopticObjectProperties();
              }
            });
          },
          "html"
        ); // 'html' is necessary to keep returned data as a string
      }
    });
  }

  function setPreviewOnObjLabel() {
    $(".svgObjLabel").mouseover(function (e) {
      $(this).css({ "text-decoration": "underline" });
      $("#svgPreview").show();

      var fileName = $(this).attr("data-previewFileName") + ".svg";
      $.get(
        location.origin + _global.pathCustomSvgObj + fileName,
        function (data) {
          var svgObj = $.parseXML(data);

          //set svg tag
          $(svgObj).find("svg").removeAttr("viewBox");
          $(svgObj)
            .find("svg")
            .attr(
              "viewBox",
              "0 0 " +
                $(svgObj).find("svg").attr("width") +
                " " +
                $(svgObj).find("svg").attr("height")
            );
          $(svgObj)
            .find("svg")
            .attr("width", $(svgObj).find("svg").attr("width"));
          $(svgObj)
            .find("svg")
            .attr("height", $(svgObj).find("svg").attr("height"));

          $("#svgPreview").width($(svgObj).find("svg").attr("width") + 10);
          $("#svgPreview").height($(svgObj).find("svg").attr("height") + 10);

          //insert to viewer
          var xmlString;
          if (window.ActiveXObject) {
            //IE
            xmlString = svgObj.xml;
            if (xmlString == undefined)
              //IE < 11
              xmlString = $(svgObj).find("svg").html("");
          } else {
            // code for Mozilla, Firefox, Opera, etc.
            xmlString = new XMLSerializer().serializeToString(svgObj);
          }

          //Is important to remove only the first string founded
          xmlString = xmlString.replace(_nsexclude, "");
          xmlString = xmlString.split("svg:svg").join("svg");

          //append svg to html
          $("#svgPreview").html(xmlString);
        },
        "html"
      );
    });

    $(".svgObjLabel").mouseout(function (e) {
      $(this).css({ "text-decoration": "none" });
      $("#svgPreview").hide();
    });
  }
}

function dialogClear(callback) {
  //set dialog position and style
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-clear");

  //insert messagge area on top
  $('<div id="dialoxBox-message">! WARNING !</div>').insertBefore(
    "#dialog_content"
  );

  //set dialog content
  var html =
    "<div>Si è sicuri di voler aprire una nuova area di lavoro dell'editor?</div>";
  $("#dialog_content").html(html);

  //buttons HTML
  var buttons_html = '<input type="button" value="NUOVO" id="dialogBox-clean">';
  buttons_html += '<input type="button" value="CHIUDI" id="dialogBox-close">';
  $("#dialog_buttons").html(buttons_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //set event buttons dialog box
  $("#dialogBox-clean").click(function () {
    closeDialog();

    currentSinottico = "";

    return callback(true);
  });
  $("#dialogBox-close").click(function () {
    closeDialog();

    return callback(false);
  });
}

function dialogSaveAs() {
  //set dialog size, position and style
  $("#dialog_container").addClass("dialogBox-saveSize");
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-save");

  //insert messagge area on top
  $('<div id="dialoxBox-message">Save synoptic.</div>').insertBefore(
    "#dialog_content"
  );

  //set dialog content
  var html = '<div><input id="newSinottico" type="text" autofocus /></div>';
  $("#dialog_content").html(html);

  //add dialog buttons
  var buttons_html = "";
  buttons_html += '<input type="button" value="SALVA" id="dialogBox-save">';
  buttons_html += '<input type="button" value="CHIUDI" id="dialogBox-close">';
  $("#dialog_buttons").html(buttons_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //set event buttons dialog box
  $("#dialogBox-save").click(function () {
    if ($("#newSinottico").val().length > 0) {
      //get synoptic's SVG
      var svg = svgCanvas.getSvgString();

      //Is important to remove only the first string founded
      svg = svg.replace(_nsexclude, "");
      //get synoptic's name
      var layoutName = $("#newSinottico").val();

      //saveAs
      var insertSynopticParam = new insertSynopticRequest(layoutName, svg);
      insertSynoptic(insertSynopticParam, function (data) {
        //check result in errorList
        var err = data.ErrorList[0];
        switch (err.Id) {
          case 1:
            currentSinottico = layoutName;
            closeDialog();
            break;
          default:
            $("#dialoxBox-message")
              .fadeOut(function () {
                $(this).html("! " + err.Description + " !");
              })
              .fadeIn();
            return;
        }
      });
    } else {
      $("#dialoxBox-message")
        .fadeOut(function () {
          $(this).html("! nessun nome inserito !");
        })
        .fadeIn();
      $("#newSinottico").first().focus();
    }
  });
  $("#dialogBox-close").click(function () {
    closeDialog();
  });
}

function dialogLoad() {
  //set custom size of dialogbox
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-load");

  //insert messagge area on top
  $('<div id="dialoxBox-message">Select a synoptic.</div>').insertBefore(
    "#dialog_content"
  );

  //set dialog content
  var html = "<div>";
  html +=
    '<ul id="loader"><li>&nbsp;</li><li><img src="images/loader.gif" height="20" width="20"></li><li>&nbsp;</li></ul>';
  html += '<select id="synopticList" style="display: none;"></select>';
  html += "</div>";
  $("#dialog_content").html(html);

  //add dialog buttons
  var buttons_html = "";
  buttons_html += '<input type="button" value="LOAD" id="dialogBox-load">';
  buttons_html += '<input type="button" value="CHIUDI" id="dialogBox-close">';
  $("#dialog_buttons").html(buttons_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  getSynopticList(null, function (data) {
    if (data.ErrorList.length == 0) {
      var synopticList = data.SynopticList;

      if (synopticList.length == 0) {
        $("#loader").hide();
        $("#dialogBox-load").prop("disabled", "disabled");
        $("#dialoxBox-message")
          .fadeOut(function () {
            $(this).html("! Synoptic list empty !");
          })
          .fadeIn();
      } else {
        $.each(synopticList, function () {
          $("#synopticList").append(
            '<option value="' + this.Name + '">' + this.Name + "</option>"
          );
        });

        $("#loader").hide();
        $("#synopticList").show();
      }
    } else {
      //error management
      var err = data.ErrorList[0];
      $("#dialoxBox-message")
        .fadeOut(function () {
          $(this).html(err.Description);
        })
        .fadeIn();
      console.log(err);
      return;
    }
  });

  //set event buttons dialog box
  $("#dialogBox-load").click(function () {
    var synopticName = $("#synopticList option:selected").text();

    if (synopticName.length == 0) {
      $("#dialoxBox-message")
        .fadeOut(function () {
          $(this).html("! no synoptic selected !");
        })
        .fadeIn();
      return;
    }

    $("#loader").show();
    $("#synopticList").hide();

    var synopticParam = new synopticRequest(synopticName);
    getSynoptic(synopticParam, function (data) {
      if (data.ErrorList.length == 0) {
        var xmlstr = data.SynopticList[0].Svg;
        currentAreaId = data.SynopticList[0].AreaId;
        currentSinottico = $("#synopticList option:selected").text();

        loadManagement(xmlstr);
        closeDialog();
      } else {
        //error management
        var err = data.ErrorList[0];
        $("#dialoxBox-message")
          .fadeOut(function () {
            $(this).html(err.Description);
          })
          .fadeIn();
        console.log(err);

        $("#loader").hide();
        $("#synopticList").show();
        return;
      }
    });
  });
  $("#dialogBox-close").click(function () {
    closeDialog();
  });
}

function dialogSynopticObjectProperties() {
  //set custom size of dialogbox
  $("#dialog_container").addClass("dialogBox-plantSize");
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-plantSize");

  //get synopticObj attributes from editor's elem_id input
  var synopticObjId = $("#elem_id").val();
  var synopticObjClass = $("#" + synopticObjId).attr("class");
  var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");

  switch (synopticObjTypeName) {
    case "Andon":
      var andonIdOld = $("#" + synopticObjId).children("rect")[0].attributes[
        "andonId"
      ].value;
      var andonId = prompt("Inserisci l'id dell' Andon", andonIdOld);
      if (andonId != undefined && andonId != "") {
        $("#" + synopticObjId).children("rect")[0].attributes["andonId"].value =
          andonId;
      }
      return;
    case "OT":
      var otIdOld = $("#" + synopticObjId).children("rect")[0].attributes[
        "otId"
      ].value;
      var otId = prompt("Inserisci l'id dell' OT", otIdOld);
      if (otId != undefined && otId != "") {
        $("#" + synopticObjId).children("rect")[0].attributes["otId"].value =
          otId;
      }
      return;
  }

  //insert messagge area on top
  $(
    '<div id="dialoxBox-message">Associate the synoptic object "' +
      synopticObjTypeName +
      '"</div>'
  ).insertBefore("#dialog_content");

  //add scripts
  var scripts =
    '<script type="text/javascript" src="jquery-1.11.1.min.js"></script>';
  scripts +=
    '<script type="text/javascript" src="synopticEditor/scripts/jsTree/jstree.min.js"></script>';

  //set dialog content
  var html = scripts;
  html += getJsTreeHTML();
  $("#dialog_content").html(html);

  //active jQuery version 1.11.1 necessary to use jsTree library
  var jQuery_1_11_1 = $.noConflict(true);
  jQuery_1_11_1("#jstree").jstree();

  //add dialog footer content
  var footer_html = "";
  //switch (synopticObjTypeName) {
  //    case "station":
  //        footer_html += getStationOptionsHTML();
  //        break;
  //    //case "LineCounterProgressBar":
  //    //    footer_html += getLineProgressOptionsHTML();;
  //    //    break;
  //}
  footer_html += "<div>";
  footer_html += '<input type="button" value="OK" id="dialogBox-ok">';
  footer_html += '<input type="button" value="CANCEL" id="dialogBox-cancel">';
  footer_html += "</div>";
  $("#dialog_buttons").html(footer_html);

  selectAssignedObjOnJsTree(synopticObjClass);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //set event buttons dialog box
  $("#dialogBox-ok").click(function () {
    //get synopticObj attributes from editor's elem_id input
    var synopticObjId = $("#elem_id").val();
    var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");

    //the selector to identify node/nodes selected
    var jsTreeNodeSelector = '[aria-selected="true"]';

    switch ($(jsTreeNodeSelector).length) {
      case 0: //no elements selected
        $("#dialoxBox-message")
          .fadeOut(function () {
            $(this).html("! no synoptic object selected !");
          })
          .fadeIn();
        return;
      case 1: //single element selected
        var plantLevel = $(jsTreeNodeSelector).attr("data-plantLevel");
        var equipmentPath = getEquipmentPathFromJsTreeNode(
          jsTreeNodeSelector,
          plantLevel
        );

        if (equipmentPath == null) {
          $("#dialoxBox-message")
            .fadeOut(function () {
              $(this).html("! association denied !");
            })
            .fadeIn();
          return;
        } else {
          var synopticObjId = $("#elem_id").val();
          var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");

          //switch (synopticObjTypeName) {
          //    case "LineCounterProgressBar":
          //        setLineProgressBarGraphic(synopticObjId);
          //        break;
          //}

          setSynopticObj(synopticObjId, jsTreeNodeSelector, equipmentPath);
          closeDialog();
        }
        break;
      default: //multiple element management (only for station)
        var jsTreeNodeList = $(jsTreeNodeSelector);

        switch (synopticObjTypeName) {
          case "station":
            var equipmentPathList = [];
            var descriptionList = [];

            //check if the nodeList containing all stations
            $.each(jsTreeNodeList, function () {
              var plantLevel = $(this).attr("data-plantLevel");
              if (plantLevel != "5") {
                $("#dialoxBox-message")
                  .fadeOut(function () {
                    $(this).html(
                      "! multiple insertion enable only for stations !"
                    );
                  })
                  .fadeIn();
                return false; //each's break
              } else {
                equipmentPathList.push(
                  getEquipmentPathFromJsTreeNode(this, plantLevel)
                );
                descriptionList.push(
                  $(this).text().replace(")", "").split(" ")[0]
                );
              }
            });

            if (
              equipmentPathList.length == jsTreeNodeList.length &&
              descriptionList.length == jsTreeNodeList.length
            ) {
              var stationPlacing = $("#stationPlacing option:selected").val();
              var stationSorting = $("#stationSorting option:selected").val();

              //set sorting disposition
              switch (stationSorting) {
                case "0": //asc
                  var startIdx = 0;
                  var endIdx = jsTreeNodeList.length - 1;
                  break;
                case "1": //desc
                  var startIdx = jsTreeNodeList.length - 1;
                  var endIdx = 0;
                  break;
              }

              addMultipleStation(
                descriptionList,
                equipmentPathList,
                startIdx,
                endIdx,
                stationPlacing,
                stationSorting
              );
              closeDialog();
              break;
            } else {
              return;
            }
          case "MultipleStationStatus":
            var equipmentPathList = [];
            var lineNodeId = $(jsTreeNodeList[0]).parent().parent().attr("id");

            //check if the nodeList containing all stations
            $.each(jsTreeNodeList, function () {
              if (lineNodeId != $(this).parent().parent().attr("id")) {
                $("#dialoxBox-message")
                  .fadeOut(function () {
                    $(this).html("! Can't add stations from different lines !");
                  })
                  .fadeIn();
                return false; //each's break
              }

              var plantLevel = $(this).attr("data-plantLevel");
              if (plantLevel != "5") {
                $("#dialoxBox-message")
                  .fadeOut(function () {
                    $(this).html(
                      "! Multiple insertion enable only for stations !"
                    );
                  })
                  .fadeIn();
                return false; //each's break
              } else {
                equipmentPathList.push(
                  getEquipmentPathFromJsTreeNode(this, plantLevel)
                );
              }

              if (equipmentPathList.length == jsTreeNodeList.length) {
                //TODO...
                closeDialog();
              } else {
                return;
              }
            });
            break;
        }
    }
  });
  $("#dialogBox-cancel").click(function () {
    closeDialog();
  });

  /* Synoptic Object Properties Functions */

  //creation of dynamic html to build the jsTree
  function getJsTreeHTML() {
    var synopticObjId = $("#elem_id").val();
    var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");

    function renderNode(node) {
      let html = "";

      html += '<li ' +
        'data-plantLevel="' + node.Level + '" ' +
        'data-equipmentId="' + getEquipmentId(node, synopticObjTypeName) + '"';

      if (node.Codice) {
        html += ' data-equipmentPath="' + node.Codice + '"';
      }

      if (node.Table) {
        html += ' data-description="' + node.Table + '"';
      }

      html += '>' + node.Descrizione;

      if (node.Children && node.Children.length > 0) {
        html += "<ul>";
        $.each(node.Children, function(i, child) {
          html += renderNode(child);
        });
        html += "</ul>";
      }

      html += "</li>";
      return html;
    }

    function getEquipmentId(node, synopticObjTypeName) {
      switch (node.Level) {
        case 3:
          return node.ObjectId + "x" + node.EquipmentId;
        case 4:
          if (synopticObjTypeName !== "StatusExtemporaryOP") {
            return node.ObjectId + "x" + node.EquipmentId;
          }
          break;
        case 5:
          if (synopticObjTypeName === "StatusExtemporaryOP") {
            return node.ParentId + "x" + node.ObjectId;
          }
          break;
      }
      return node.EquipmentId;
    }

    let html = '<div id="jstree"><ul>';

    $.each(areaList, function(i, area) {
      html += renderNode(area);
    });

    html += "</ul></div>";

    return html;
  }

  //dialog option to insert stations into editor
  function getStationOptionsHTML() {
    var html = "";
    html += '<div><ul id="stationOptions">';
    html += "<li>Stations placing:</li>";
    html += '<li><select id="stationPlacing" disabled>';
    html += '<option value="0">Horizontal</option>';
    html += '<option value="1">Vertical</option>';
    html += "</select></li>";
    html += "<li>Stations sorting:</li>";
    html += '<li><select id="stationSorting" disabled>';
    html += '<option value="0">asc</option>';
    html += '<option value="1">desc</option>';
    html += "</select></li>";
    html += "</ul></div>";
    html += '<div style="font-size: 7px;">&nbsp;</div>';

    $("#dialog_content")
      .removeClass("dialogContent-plantSize")
      .addClass("dialogContent-plantSize-station");

    //active jsTree onChange to listen when it's selected multiple station to enable placing, sorting select
    jQuery_1_11_1("#jstree").on("changed.jstree", function (e, data) {
      if (data.selected.length > 1) {
        $("#stationPlacing").removeAttr("disabled");
        $("#stationSorting").removeAttr("disabled");
      } else {
        $("#stationPlacing").prop("disabled", "disabled");
        $("#stationSorting").prop("disabled", "disabled");
      }
    });

    return html;
  }

  //dialog option to insert lineProgressBar into editor
  function getLineProgressOptionsHTML() {
    var html = "";
    html += "<div>";
    html += '<ul id="lineProgressBarOptions">';
    html += "<li>Placing:</li>";
    html += '<li><select id="linepbPlacing" disabled>';
    html += '<option value="horizontal">Horizontal</option>';
    html += '<option value="vertical">Vertical</option>';
    html += "</select></li>";
    html += "<li>Sorting:</li>";
    html += '<li><select id="linepbSorting" disabled>';
    html += '<option value="asc">asc</option>';
    html += '<option value="desc">desc</option>';
    html += "</select></li>";
    html += "<li>Stations:</li>";
    html += '<li><input id="stationNumber" value="1" disabled></li>';
    html += "</ul>";
    html += "</div>";
    html += '<div style="font-size: 7px;">&nbsp;</div>';

    $("#dialog_content")
      .removeClass("dialogContent-plantSize")
      .addClass("dialogContent-plantSize-lineProgressBar");

    return html;
  }

  //retrive the equipment path of the synoptic object selected
  function getEquipmentPathFromJsTreeNode(nodeSelector, level) {
    switch (level) {
      case "2": //line level
      case "3": //Thread
        //get synopticObjId from editor's elem_id input
        var synopticObjId = $("#elem_id").val();
        var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");
        switch (synopticObjTypeName) {
          case "counter":
          case "LineStatus": //deprecated
          case "Status":
          case "StatusList":
          case "StatusListSC":
          case "StatusCapStation":
          case "StatusSeats":
          case "StatusSupportConnector":
          case "StatusCpStation":
          case "Info":
          case "StatusCamera":
          case "StatusTanksBumper":
          case "StatusExtemporary":
          case "StatusPickToLight":
          case "StatusSniffer":
          case "StatusSetPoint":
          case "SequenceAlarm":
          case "StatusDashboard":
            var lineId = $(nodeSelector).attr("data-equipmentId");
            var areaId = $(nodeSelector)
              .parent()
              .parent()
              .attr("data-equipmentId");
            return areaId + "-" + lineId;
          case "StatusThread":
            var equipmentPath = null;

            //check if an accumulator is selected
            if (
              $(nodeSelector).parent().parent().attr("data-plantLevel") === "2"
            ) {
              var Id = $(nodeSelector).attr("data-equipmentId");
              var lineId = $(nodeSelector)
                .parent()
                .parent()
                .attr("data-equipmentId");
              var areaId = $(nodeSelector)
                .parent()
                .parent()
                .parent()
                .parent()
                .attr("data-equipmentId");
              equipmentPath = areaId + "-" + lineId + "-" + Id;
            }

            return equipmentPath;
        }
        break;
      case "4": //Battery Pack
      case "5": //Status Extemporary OP
        var synopticObjId = $("#elem_id").val();
        var synopticObjTypeName = $("#" + synopticObjId).attr("type_name");
        switch (synopticObjTypeName) {
          case "Cella":
          case "BatteryPack":
          case "StationBatteryPack":
          case "BatteryPackCounter":
          case "StatusExtemporaryOP":
          case "BatteryPackAGV":
          case "StopLightIn":
          case "StopLightOut":
            var equipmentPath = null;

            //check if an accumulator is selected
            if (
              $(nodeSelector).attr("data-plantLevel") == "5"
            ) {
              equipmentPath = $(nodeSelector).attr("data-equipmentPath");
            }
            return equipmentPath;
            break;
        }
        break;
      default: //area and linegroup level (2,3) not managed
        return null;
    }
  }

  //set information in synoptic object
  function setSynopticObj(id, nodeSelector, equipmentPath) {
    //add classes to set the functionality of the synoptic object
    var short_desc = $(nodeSelector).text().split("_");
    var plantLevel = $(nodeSelector).attr("data-plantLevel");
    var synopticObjTypeName = $("#" + id).attr("type_name");
    switch (synopticObjTypeName) {
      case "Info":
        $("#" + id).attr("class", "equipmentPath_" + equipmentPath + " info");
        break;
      case "StatusList":
      case "StatusListSC":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " statuslist"
        );
        break;
      case "Status":
      case "LineStatus": //deprecated
        $("#" + id).attr("class", "equipmentPath_" + equipmentPath + " status");
        break;
      case "StatusThread": //deprecated
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " statusthread"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "lineCounter":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " lineCounter"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "LineCounterProgressBar":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " lineCounterProgressBar"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusCapStation":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " capStation"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusCamera":
        $("#" + id).attr("class", "equipmentPath_" + equipmentPath + " camera");
        break;
      case "StatusTanksBumper":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " tanksBumper"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusSeats":
        $("#" + id).attr("class", "equipmentPath_" + equipmentPath + " seats");
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusSupportConnector":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " suppConnect"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusCpStation":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " statusCpStation"
        );
        break;
      case "StatusExtemporary":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " extemporary"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusExtemporaryOP":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " extemporaryOP"
        );
        break;
      case "StatusPickToLight":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " pickToLight"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusSniffer":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " sniffer"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "StatusSetPoint":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " setPoint"
        );
        $("#" + id)
          .children("text")
          .text(short_desc[short_desc.length - 1]);
        break;
      case "counter":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " counter"
        );

        switch (plantLevel) {
          case "4":
            $("#" + id)
              .children('text[class="desc"]')
              .text(short_desc[short_desc.length - 1]);
            break;
          case "5":
            $("#" + id)
              .children('text[class="desc"]')
              .text(short_desc[0]);
            break;
        }
        break;
      case "SequenceAlarm":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " sequenceAlarm"
        );
        break;
      case "StatusDashboard":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " statusDashboard"
        );
        break;
      case "BatteryPack":
        var _desc = $(nodeSelector).attr("data-description");
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " batteryPack"
        );
        $("#" + id)
          .children('text[class="bin"]')
          .text(_desc);
        break;
      case "StationBatteryPack":
        var _desc = $(nodeSelector).attr("data-description");
        $("#" + id)
          .children("rect")
          .attr("fill", "url(#grad_" + equipmentPath + ")");
        $("#" + id)
          .children(0)
          .children(0)[0].id = "grad_" + equipmentPath;
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " stationBatteryPack"
        );
        $("#" + id)
          .children('text[class="value"]')
          .text(_desc);
        break;
      case "BatteryPackCounter":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " counterBatteryPack"
        );
        $("#" + id)
          .children('text[class="value"]')
          .text("##");
        break;
      case "BatteryPackAGV":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " agvBatteryPack"
        );
        $("#" + id)
          .children('text[class="partNumber"]')
          .text("");
        $("#" + id)
          .children('text[class="agvTitle"]')
          .text("");
        break;
      case "StopLightIn":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " stopLightIn"
        );
        break;
      case "StopLightOut":
        $("#" + id).attr(
          "class",
          "equipmentPath_" + equipmentPath + " stopLightOut"
        );
        break;
       case "Cella":
         $("#" + id).attr("class", "equipmentPath_" + equipmentPath + " cella");
         break;
    }
  }

  //insert multiple station management
  function addMultipleStation(
    stationDescriptionList,
    stationEquipmentPathList,
    currentStationIdx,
    lastStationidx,
    placing,
    sorting
  ) {
    var i = currentStationIdx;

    //get synoptic station object info
    var synopticObjId = $("#elem_id").val();
    var synopticObjPosX = $("#" + synopticObjId)
      .children("rect")
      .attr("x");
    var synopticObjPosY = $("#" + synopticObjId)
      .children("rect")
      .attr("y");

    //set synoptic station object
    var equipmentPath = stationEquipmentPathList[i];
    var stationDescription = stationDescriptionList[i];
    $("#" + synopticObjId).attr(
      "class",
      "equipmentPath_" + equipmentPath + " station status"
    );
    $("#" + synopticObjId)
      .children("text")
      .text(stationDescription);

    //check station description length to reduce fonte size
    if (stationDescription.length > 8) {
      if (_typeStationSelected == "LARGE")
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "28");
      else
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "14");
    } else if (stationDescription.length > 5) {
      if (_typeStationSelected == "LARGE")
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "25");
      else
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "15");
    } else {
      if (_typeStationSelected == "LARGE")
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "35");
      else
        $("#" + synopticObjId)
          .children('text[class="desc"]')
          .attr("font-size", "20");
    }

    //init text values
    $("#" + synopticObjId)
      .children('text[class="text"]')
      .text("-");
    $("#" + synopticObjId)
      .children('text[class="value"]')
      .text("0");

    //check if last station has been drawn and exit
    if (currentStationIdx == lastStationidx) {
      return;
    }

    //add next station in new position
    var url = location.origin + _global.pathCustomSvgObj;
    var fileName = "Station_Medium.svg";
    var offset = 80;
    if (_typeStationSelected == "LARGE") {
      fileName = "Station_Large.svg";
      offset = 125;
    }
    $.get(
      url + fileName,
      function (data) {
        //add next station
        svgCanvas.importCustomSvg(data);

        //set next position
        switch (placing) {
          case "0": //horizontal
            $("#selected_x")
              .val(synopticObjPosX + offset)
              .trigger("change");
            break;
          case "1": //vertical
            $("#selected_y")
              .val(synopticObjPosY + offset)
              .trigger("change");
            break;
        }

        switch (sorting) {
          case "0": //asc
            i++;
            break;
          case "1": //desc
            i--;
            break;
        }

        addMultipleStation(
          stationDescriptionList,
          stationEquipmentPathList,
          i,
          lastStationidx,
          placing,
          sorting
        );
      },
      "html"
    ); // 'html' is necessary to keep returned data as a string
  }

  //calculate the jsTreePath
  function getJsTreePath(equipmentPath, typeName) {
    var areaId = equipmentPath[0];
    var lineId = equipmentPath[1];
    var objId = equipmentPath[2];
    var wipId = equipmentPath[3] || null;
    var jsTreePath = [];

    $.each(areaList, function (i, area) {
      if (area.EquipmentId == areaId) {
        //management an empty node
        if (area.Children == undefined) return true; //each's continue

        $.each(area.Children, function (i, lines) {
          switch (equipmentPath.length) {
            case 2:
              if (lines.EquipmentId == lineId) {
                //jsTreePath.push(area.EquipmentId);
                jsTreePath.push(lines.ParentId);
                jsTreePath.push(lines.ParentId);
                jsTreePath.push(lineId);

                return false; //each's break
              }
              break;
            case 3: //station or accumulo
              var obj = equipmentPath[2];
              var objOP = equipmentPath[1] + "x" + equipmentPath[2];
              $.each(lines.Children, function (i, objs) {
                switch (typeName) {
                  case "StatusThread":
                    if (objs.ObjectTypeId + "x" + objs.EquipmentId == obj) {
                      //jsTreePath.push(areaId);
                      jsTreePath.push(lineId);
                      jsTreePath.push(obj);

                      return false; //each's break
                    }
                    break;
                  case "StatusExtemporaryOP":
                    if (objs.ParentId + "x" + objs.ObjectId == objOP) {
                      jsTreePath.push(areaId);
                      jsTreePath.push(lineId);
                      jsTreePath.push(objOP);

                      return false; //each's break
                    }
                    break;
                }
              });
              break;
            //case 4:
            //    if (lines.EquipmentId == lineId) {

            //        jsTreePath.push(areaId);
            //        jsTreePath.push(lineId);
            //        jsTreePath.push(objId);
            //        jsTreePath.push(wipId);

            //        return false; //each's break
            //    }
            //    break;
            case 4: //Battery Pack
              var obj = equipmentPath[2] + "x" + equipmentPath[3];
              $.each(lines.Children, function (i, objs) {
                switch (typeName) {
                  case "BatteryPack":
                  case "StationBatteryPack":
                  case "BatteryPackCounter":
                  case "BatteryPackAGV":
                  case "StopLightIn":
                  case "StopLightOut":
                    if (objs.ObjectTypeId + "x" + objs.EquipmentId == obj) {
                      jsTreePath.push(areaId);
                      jsTreePath.push(lineId);
                      jsTreePath.push(obj);

                      return false; //each's break
                    }
                    break;
                }
              });
              break;
          }

          //management an empty node
          //if (lines.Children == undefined)
          //    return true; //each's continue

          //$.each(lines.Children, function (i, objs) {

          //    switch (equipmentPath.length) {
          //        case 2://line - Vision Alarm
          //            if (lines.EquipmentId == lineId) {

          //                //jsTreePath.push(area.EquipmentId);
          //                jsTreePath.push(lines.ParentId);
          //                jsTreePath.push(lines.ParentId);
          //                jsTreePath.push(lineId);

          //                return false; //each's break
          //            }
          //            break;
          //        case 6:// Stock
          //        case 4:// Camera
          //        case 3://station or accumulo
          //            switch (typeName) {
          //                case "StatusList":
          //                case "Status":
          //                case "Info":
          //                case "counter":
          //                    //management an empty node
          //                    var stationId = equipmentPath[2];
          //                    $.each(line.Children, function (i, station) {

          //                        if (station.EquipmentId == stationId) {

          //                            //jsTreePath.push(area.EquipmentId);
          //                            jsTreePath.push(lines.ParentId);
          //                            jsTreePath.push(objs.LineId);
          //                            jsTreePath.push(station.EquipmentId);

          //                            return false; //each's break
          //                        }
          //                    });
          //                    break;
          //                case "StatusThread":
          //                    var Equipnew = objs.ObjectTypeId + 'x' + objs.EquipmentId;
          //                    if (Equipnew == objId && objs.ParentId == lineId) {

          //                        //jsTreePath.push(areaId);
          //                        jsTreePath.push(lineId);
          //                        jsTreePath.push(Equipnew);

          //                        return false; //each's break
          //                    }
          //                    break;
          //            }
          //            break;
          //    }

          //    if (jsTreePath.length > 0) {
          //        return false; //each's break
          //    }
          //});

          if (jsTreePath.length > 0) {
            return false; //each's break
          }
        });

        if (jsTreePath.length > 0) {
          return false; //each's break
        }
      }
    });

    return jsTreePath;
  }

  //check if the object is already assigned and select it on jsTree
  function selectAssignedObjOnJsTree(classValue) {
    //expand always area's linegroups
    $("#jstree").find(".jstree-icon.jstree-ocl").trigger("click");

    if (classValue != undefined && classValue != "") {
      var eqPath = classValue.split(" ")[0].split("_")[1].split("-");
      var jsTreePath = getJsTreePath(eqPath, synopticObjTypeName);

      switch (synopticObjTypeName) {
        case "Status":
        case "StatusList":
        case "StatusListSC":
        case "Info":
        case "Cella":
        case "SequenceAlarm":
        case "StatusThread":
          //for each jsTree node path trigger click
          $.each(jsTreePath, function (i) {
            $("#jstree")
              .find('[data-equipmentid="' + this + '"] .jstree-icon.jstree-ocl')
              .trigger("click");

            //for the last node select the node
            if (i == jsTreePath.length - 1) {
              $("#jstree")
                .find('[data-equipmentid="' + this + '"]')
                .attr("aria-selected", "true");
              $("#jstree")
                .find('[data-equipmentid="' + this + '"]')
                .children("a.jstree-anchor")
                .addClass("jstree-clicked");

              //wait the end of the render and set focus on node selected
              setTimeout(function () {
                $('[aria-selected="true"]').children("a").focus();
              }, 650);
            }
          });
          break;
        case "BatteryPack":
        case "StationBatteryPack":
        case "BatteryPackCounter":
        case "StatusExtemporaryOP":
        case "BatteryPackAGV":
        case "StopLightIn":
        case "StopLightOut":
          //for each jsTree node path trigger click
          for (var i = 1; i < jsTreePath.length; i++) {
            $("#jstree")
              .find(
                '[data-equipmentid="' +
                  jsTreePath[i] +
                  '"] .jstree-icon.jstree-ocl'
              )
              .trigger("click");

            //for the last node select the node
            if (i == jsTreePath.length - 1) {
              //$("#jstree").find('[data-equipmentid="' + jsTreePath[i] + '"] .jstree-icon.jstree-ocl').trigger("click");
              $("#jstree")
                .find('[data-equipmentid="' + jsTreePath[i - 1] + '"]')
                .find(".jstree-children")
                .children('[data-equipmentid="' + jsTreePath[i] + '"]')
                .attr("aria-selected", "true");
              $("#jstree")
                .find('[data-equipmentid="' + jsTreePath[i - 1] + '"]')
                .find(".jstree-children")
                .children('[data-equipmentid="' + jsTreePath[i] + '"]')
                .find("a.jstree-anchor")
                .addClass("jstree-clicked");

              //wait the end of the render and set focus on node selected
              setTimeout(function () {
                $('[aria-selected="true"]').children("a").focus();
              }, 650);

              break;
            }
          }
          break;
        default:
          //for each jsTree node path trigger click
          for (var i = 0; i < jsTreePath.length; i++) {
            $("#jstree")
              .find(
                '[data-equipmentid="' +
                  jsTreePath[i] +
                  '"] .jstree-icon.jstree-ocl'
              )
              .trigger("click");

            //for the last node select the node
            if (i == jsTreePath.length - 2) {
              //$("#jstree").find('[data-equipmentid="' + jsTreePath[i] + '"] .jstree-icon.jstree-ocl').trigger("click");
              $("#jstree")
                .find('[data-equipmentid="' + jsTreePath[i] + '"]')
                .find(".jstree-children")
                .children('[data-equipmentid="' + jsTreePath[i + 1] + '"]')
                .attr("aria-selected", "true");
              $("#jstree")
                .find('[data-equipmentid="' + jsTreePath[i] + '"]')
                .find(".jstree-children")
                .children('[data-equipmentid="' + jsTreePath[i + 1] + '"]')
                .find("a.jstree-anchor")
                .addClass("jstree-clicked");

              //wait the end of the render and set focus on node selected
              setTimeout(function () {
                $('[aria-selected="true"]').children("a").focus();
              }, 650);

              break;
            }
          }
          break;
      }
    }
  }

  //set lineProgressBar's graphic
  function setLineProgressBarGraphic(id) {
    //get options
    var linepbPlacing = $("#linepbPlacing option:selected").val();
    var linepbSorting = $("#linepbSorting option:selected").val();
    var stationNumber = $("#stationNumber").val();

    //set options on lineProgressBar
    switch (linepbPlacing) {
      case "horizontal":
        $("#angleLabel").val(0).trigger("change");
        break;
      case "vertical":
        $("#angleLabel").val(90).trigger("change");
        break;
    }
    switch (linepbSorting) {
      case "asc":
        break;
      case "desc":
        break;
    }

    var widthLinepb = 72;
    for (var i = 0; i < stationNumber - 1; i++) {
      widthLinepb += 80;
    }
    $("#" + id)
      .children("rect")
      .attr("width", widthLinepb);
  }
}

function dialogInformation(title, messageContent) {
  //set custom size of dialogbox
  $("#dialog_container").css(
    "margin-left",
    -parseInt($("#dialog_container").width()) / 2
  );
  $("#dialog_container").css(
    "margin-top",
    -parseInt($("#dialog_container").height()) / 2
  );
  $("#dialog_content").addClass("dialogContent-areaSelection");

  //insert messagge area on top
  $(
    '<div id="dialoxBox-message">Select the transitStation to associate.</div>'
  ).insertBefore("#dialog_content");

  //set dialog content
  var html = "<div>" + messageContent + "</div>";
  $("#dialog_content").html(html);

  //add dialog buttons
  var buttons_html = "";
  buttons_html += '<input type="button" value="CHIUDI" id="dialogBox-close">';
  $("#dialog_buttons").html(buttons_html);

  //open dialog
  $("#dialog_box").show();
  $(".overlay").unbind("click");

  //set event buttons dialog box
  $("#dialogBox-close").click(function () {
    closeDialog();
  });
}

//LAYERS

function removeDefaultLayer() {
  svgCanvas.setCurrentLayer("Layer 1");
  svgCanvas.deleteCurrentLayer();
}

function setSynopticLayer(name, isBase) {
  var layer = $("title:contains(" + name + ")").parent("g");
  layer.attr("data-layerName", name);
  layer.attr("data-layerBase", isBase);
}

//UTILITY

function closeDialog() {
  //cloase dialog
  $("#dialog_box").hide();
  $(".overlay").bind("click");

  //reset dialog
  $("#dialog_container").attr("class", "");
  $("#dialog_content").attr("class", "");
  $("#dialog_content").html("");
  $("#dialog_buttons").html("");
  $("#dialoxBox-message").remove();
}

function wrapString(str, maxRowLength) {
  var words = str.split(" ");
  var rowLength = 0;
  var maxWordLength = 0;
  var strWrapped = "";

  //get the max word length
  for (var i = 0; i < words.length; i++) {
    if (words[i].length > maxWordLength) maxWordLength = words[i].length;
  }

  //check maxRowLength with maxWordLength
  if (maxRowLength < maxWordLength) maxRowLength = maxWordLength;

  //wrap string
  for (var i = 0; i < words.length; i++) {
    rowLength += words[i].length;

    if (rowLength > maxRowLength) {
      rowLength = 0;
      strWrapped += "\n";
    } else {
      strWrapped += " ";
    }

    strWrapped += words[i];
  }

  return strWrapped;
}

//AJAX CALLS

function getPlantTree(param, callback) {
  $.ajax({
    type: "POST",
    url: _global.ulrGetPlantModelTree,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    //data: JSON.stringify(param),//.toJsonString(),
    success: function (data) {
      callback(data);
    },
    error: function (xhr, status, error) {
      //management client error
      var result = {
        ErrorList: [
          {
            Description:
              "getPlantTree()  [Status: " +
              status +
              " || Error: " +
              error +
              "]",
          },
        ],
      };
      callback(result);
    },
  });
}

function getSynopticList(param, callback) {
  $.ajax({
    type: "POST",
    url: _global.urlGetSynopticList,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    //data:  param.toJsonString(),
    success: function (data) {
      callback(data);
    },
    error: function (xhr, status, error) {
      //management client error
      var result = {
        ErrorList: [
          {
            Description:
              "getSynopticList()  [Status: " +
              status +
              " || Error: " +
              error +
              "]",
          },
        ],
      };
      callback(result);
    },
  });
}

function insertSynopticRequest(synopticName, synopticSVG) {
  this.AreaId = currentAreaId;
  this.SynopticName = synopticName;
  this.SynopticSVG = synopticSVG;

  this.toJsonString = function () {
    return JSON.stringify(this);
  };
}
function modelTreeRequest() {
  this.AreaId = currentAreaId;

  this.toJsonString = function () {
    return JSON.stringify(this);
  };
}

function insertSynoptic(param, callback) {
  $.ajax({
    type: "POST",
    url: _global.urlInsertSynoptic,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: param.toJsonString(),
    success: function (result) {
      callback(result);
    },
    error: function (xhr, status, error) {
      //management client error
      var result = {
        ErrorList: [
          {
            Description:
              "saveSynoptic()  [Status: " +
              status +
              " || Error: " +
              error +
              "]",
          },
        ],
      };
      callback(result);
    },
  });
}

function synopticRequest(synopticName) {
  this.SynopticName = synopticName;

  this.toJsonString = function () {
    return JSON.stringify(this);
  };
}

function getSynoptic(param, callback) {
  $.ajax({
    type: "POST",
    url: _global.urlGetSynoptic,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: param.toJsonString(),
    success: function (result) {
      callback(result);
    },
    error: function (xhr, status, error) {
      //management client error
      var result = {
        ErrorList: [
          {
            Description:
              "getSynoptic()  [Status: " + status + " || Error: " + error + "]",
          },
        ],
      };
      callback(result);
    },
  });
}

function updateSynopticRequest(synopticName, synopticSVG) {
  this.AreaId = currentAreaId;
  this.SynopticName = synopticName;
  this.SynopticSVG = synopticSVG;

  this.toJsonString = function () {
    return JSON.stringify(this);
  };
}

function updateSynoptic(param, callback) {
  $.ajax({
    type: "POST",
    url: _global.urlUpdateSynoptic,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: param.toJsonString(),
    success: function (result) {
      callback(result);
    },
    error: function (xhr, status, error) {
      //management client error
      var result = {
        ErrorList: {
          Description:
            "saveSynoptic()  [Status: " + status + " || Error: " + error + "]",
        },
      };
      callback(result);
    },
  });
}

//function getTransitStationsRegistry(param, callback) {

//    $.ajax({
//        type: "POST",
//        url: _global.webApiUrl + "GetTransitStationsRegistry",
//        contentType: "application/json; charset=utf-8",
//        dataType: 'json',
//        //data:  param.toJsonString(),
//        success: function (data) {
//            callback(data);
//        },
//        error: function (xhr, status, error) {
//            //management client error
//            var result = {
//                ErrorList: {
//                    Description: "getSynopticList()  [Status: " + status + " || Error: " + error + "]"
//                }
//            }
//            callback(result);
//        }
//    });
//}

function ajaxErrorFormatDescription(apiMethod, jqXHR, textStatus, errorThrown) {
  var str = "";
  str += "" + "\n";
  return (
    "WebInterface - " +
    apiMethod +
    "[Status: " +
    textStatus +
    " || Error: " +
    errorThrown +
    "]"
  );
} //work in progress...
