$(document).ready(function() {
   
   resetForm(); 

   $('#add_course').click(function() {
      $('#course_div').append($('#course_copy').clone().removeAttr("id").show());
      initTypeahead();
   });

   $('#add_tutor').click(function() {
      $('#tutor').show();
      $('add_tutor').hide();
   });

   $('#add_courseTutor').click(function() {
      $('#courseTutor_div').append($('#courseTutor_copy').clone().removeAttr("id").show());
      initTypeahead();
   });

   $('#add_force').click(function() {
      $('#force_div').append($('#force_copy').clone().removeAttr("id").show());
      fuckIE();
   });

   $('.sort_by').click(function() {
      $(this).attr("disabled", "disabled");
      $('#sort_div').show();

      var val = $('#sort_by_ordered').val();
      if (val != "") {
         $('#sort_by_ordered').val(val + ", " + $(this).val());
      } else {
         $('#sort_by_ordered').val($(this).val());
      }
   });

   $('#sort_reset').click(function() {
      resetSortDiv();
   });

   $('#reset').click(function() {
      resetForm();
   });

   $('#generate').click(function() {
      generateTimetables();
   });

   initTypeahead();
   fuckIE();
});

function resetForm() {
   hideSpinner();
   resetSortDiv();

   $('#input_form input[type="text"]').each(function() {
      $(this).val('');
   });

   $('#results').html('');
   fuckIE();
}

function resetSortDiv() {
   $('.sort_by').removeAttr("disabled").prop("checked", false);
   $('#sort_div').hide();
   $('#sort_by_ordered').val('');
}

function showSpinner() {
   $('#spinner_div').show();
}

function hideSpinner() {
   $('#spinner_div').hide();
}

function generateTimetables() {
   $('#results').html('');
   showSpinner();

   var courses = [];
   var coursesTutor = [];
   var force_courses = [];
   var force_course_times = [];

   $('.course').each(function(index, val) {
      courses.push($(val).val());
   });
   courses = courses.join(",");

   $('.force_course').each(function(index, val) {
      force_courses.push($(val).val());
   });
   force_courses = force_courses.join(",");

   $('.force_course_time').each(function(index, val) {
      force_course_times.push($(val).val());
   });
   force_course_times = force_course_times.join(",");

   $('.courseTutor').each(function(index, val) {
      coursesTutor.push($(val).val());
   });
   coursesTutor = coursesTutor.join(",");

   $.ajax({
      url: "generate.json",
      type: "POST",

      data: {
         courses: courses,
         coursesTutor: coursesTutor,
         clash: $('#clash').val(),
         sort_by_ordered: $('#sort_by_ordered').val(),
         force_courses: force_courses,
         force_course_times: force_course_times,
         include_closed: $('#include_closed').is(':checked')
      },

      success: function(results) {
         hideSpinner();

         if (results.timetables.length > 0) {
            $('#results').append($('<p />').html(results.timetables.length.toString() + 
                                                 ' timetable(s) generated.'));
         } else {
            $('#results').append($('<p />').html('No valid timetables found.'));
         }

         for (var i = 0; i < results.warnings.length; i++) {
            $('#results').append($('<div />', {'class': 'alert'}).html(results.warnings[i]));
         }

         var htmlTables = "";
         for (var i = 0; i < results.timetables.length; i++) {
            htmlTables += timetableToHtml(results.courses, results.timetables[i]);
         }

         $('#results').html($('#results').html() + htmlTables);
         $("html, body").animate({scrollTop: $('#results').offset().top}, 900);
      },

      dataType: "json"
   });
}

function initTypeahead() {
   $('.course').typeahead({
      source: courses,
      items: 6,
      minLength: 2,
      highlighter: function(item) {
         return "<li data-value=\"" + item + "\">" + item + " - " + course_names[binarySearch(courses,item,0,courses.length-1)] + "</li>";
      }
   });
}

function fuckIE() {
   if (!Modernizr.input.placeholder){
      $('input[type="text"]').each(function() {
         var placeholder = $(this).attr("placeholder");
         if (typeof(placeholder) != 'undefined' && placeholder != "") {
            $(this).val($(this).attr("placeholder"));
            $(this).css('color', '#999999');

            $(this).blur(function() {
               if ($(this).val() == "") {
                  $(this).val($(this).attr("placeholder"));
                  $(this).css('color', '#999999');
               }
            });
            
            $(this).focus(function() {
               if ($(this).val() == $(this).attr("placeholder")) {
                  $(this).val("");
                  $(this).css('color', '');
               }
            });
         }
      });
   }
}

function binarySearch(arr, val, start, end) {
   while (start <= end) {
      var middle = (start+end) >> 1;
    
      if (arr[middle] < val) {
         start = middle + 1;
      } else if (arr[middle] > val) {
         end = middle - 1;
      } else {
         return middle;
      }   
   }   

   return -1; 
}

