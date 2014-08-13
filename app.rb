require 'sinatra'
require 'json'
require './timetabler'

class Octangles < Sinatra::Base 
   configure do 
     set :sort_options, {'days' => 'Least days at uni',
                         'hours' => 'Least hours at uni',
                         'sleep_in_time' => 'Sleep in time',
                         'end_time' => 'Earlier end times',
                         'hours_sd' => 'Minimise differences between hours each day'}
   end

   helpers do
     def get_params
       @timetables = []
       @input_courses = params[:courses]
       @input_coursesTutor = params[:coursesTutor]
       @clash = params[:clash]
       @sort_by = params[:sort_by]
       @sort_by_ordered = params[:sort_by_ordered]
       @force_courses = params[:force_courses]
       @force_course_times = params[:force_course_times]
       @include_closed = params[:include_closed] == 'true' ? true : false
       @sort_options = settings.sort_options
     end
   end

   get '/' do
     @title = "Octangles"
     get_params

     erb :index
   end

   post '/generate.json' do
     content_type :json
     get_params

     courses = []
     coursesTutor = []
     warnings = []

     course_names = @input_courses.split(',').map{|x| x.strip.upcase}.select{|x| x != '' }.uniq
     courseTutor_names = @input_coursesTutor.split(',').map{|x| x.strip.upcase}.select{|x| x != '' }.uniq


     course_names.each do |c|
       new_course = Course.new(c, warnings, :include_closed => 
                                            @include_closed)
     courseTutor_names.each do |c|
       new_courseTutor = Course.new(c, warnings, :include_closed => 
                                            true)

       if new_course.activities != {}
         courses << new_course
       else
         warnings << "No classes found for #{c}"
       end

       if new_courseTutor.activities != {}
         coursesTutor << new_courseTutor
       else
         warnings << "No classes found for #{c}"
       end
     end

     force_courses = @force_courses.split(',');
     force_course_times = @force_course_times.split(',');

     timetables = Timetabler::generate(courses, courseTutor, :clash => @clash.to_i,
                                                 :sort_by => @sort_by_ordered,
                                                 :force_courses => 
                                                   force_courses.zip(force_course_times))

     {:timetables => timetables, :courses => course_names, :coursesTutor => courseTutor_names, :warnings => warnings.uniq}.to_json
   end
end
