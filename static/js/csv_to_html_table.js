var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];


                var $tableHeadRow2 = $("<tr></tr>");
                // Model,Overall,Visual Similarity,Counting,Relative Depth,
                // Jigsaw,Art Style,Functional Correspondence,Semantic Correspondence,Spatial Relation,
                // Object Localization,Visual Correspondence,Multi-view Reasoning,Relative Reflectance,Forensic Detection,IQ Test
                const explanations = ["The name of the model", 
                "Overall score for all tasks", 
                "Score for Visual Similarity task", 
                "Score for Counting task", 
                "Score for Relative Depth task", 
                "Score for Jigsaw task", 
                "Score for Art Style task", 
                "Score for Functional Correspondence task", 
                "Score for Semantic Correspondence task", 
                "Score for Spatial Relation task", 
                "Score for Object Localization task", 
                "Score for Visual Correspondence task", 
                "Score for Multi-view Reasoning task", 
                "Score for Relative Reflectance task", 
                "Score for Forensic Detection task", 
                "Score for IQ Test task"];
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                    var explanation = explanations[headerIdx];
                    $tableHeadRow2Cell = $("<th class='tooltip'></th>").text(csvHeaderRow[headerIdx]);
                    $tableHeadRow2Cell.append($("<span class='tooltiptext'></span>").text(explanation));
                    $tableHeadRow2.append($tableHeadRow2Cell);
                }
                $tableHeadRow2.css("background-color", "#f5f5f5");
                $tableHead.append($tableHeadRow2);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $("<tr></tr>");
                    for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];
                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        if (colIdx == 0) {
                            // left align
                            $tableBodyRowTd.css("text-align", "left");
                            // click to see more info
                            var cellValue = csvData[rowIdx][colIdx];
                            var url = 'https://github.com/zeyofu/BLINK_Benchmark/tree/main/eval/saved_outputs';
                            $tableBodyRowTd.html('<a href="' + url + '">' + cellValue + '</a>');
                        }
                        if (colIdx == 1 || colIdx == 0) {
                            $tableBodyRowTd.css("border-right", "1px solid #dbdbdb");
                        }
                        // if API, then set the background color of the row to light red
                        if (rowIdx > 2 && rowIdx < 9) {
                            $tableBodyRow.css("background-color", "#FEFAE3");
                        }
                        // if open source model, then set the background color of the row to light green
                        if (rowIdx <3 || rowIdx > 8) {
                            $tableBodyRow.css("background-color", "#F8FBFD");
                        }
                        // if random, light blue
                        if (csvData[rowIdx][0] == "Random Choice") {
                            $tableBodyRow.css("background-color", "#FEF4E4");
                        }


                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);
                    }
                }
                $table.append($tableBody);
                $table.DataTable(datatables_options);
                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};